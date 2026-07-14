// RAG Pipeline — chunking, retrieval, context assembly
const db = require('../config/db');
const embedder = require('./embeddingService');

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

class RAGPipeline {
  // ─── Text Chunking ──────────────────────────────────────────
  chunkText(text, options = {}) {
    const size = options.chunkSize || CHUNK_SIZE;
    const overlap = options.chunkOverlap || CHUNK_OVERLAP;
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    let current = '';
    for (const sentence of sentences) {
      if ((current + sentence).length > size && current.length > 0) {
        chunks.push(current.trim());
        current = sentence;
        // Add overlap from previous chunk end
        const prevWords = current.split(' ').slice(-20);
        if (prevWords.length > 0) current = prevWords.join(' ') + ' ' + sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  // ─── Embed & Store Chunks ──────────────────────────────────
  async indexBook(bookId, chunks, fileId, metadata = {}) {
    const values = [];
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const embedding = await embedder.embedText(text);
      const tokenCount = text.split(/\s+/).length;
      values.push({
        book_id: bookId,
        file_id: fileId,
        chunk_index: i,
        chunk_text: text,
        page_number: metadata.pageNumber || null,
        chapter: metadata.chapter || null,
        topic: metadata.topic || null,
        keywords: metadata.keywords || [],
        embedding: embedding ? `{${embedding.join(',')}}` : null,
        token_count: tokenCount,
        metadata: JSON.stringify(metadata)
      });
    }

    // Batch insert
    const client = await db.connect();
    try {
      for (const v of values) {
        await client.query(
          `INSERT INTO ai_schema.book_chunks
           (book_id, file_id, chunk_index, chunk_text, page_number, chapter, topic, keywords, embedding, token_count, metadata)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::double precision[],$10,$11)`,
          [v.book_id, v.file_id, v.chunk_index, v.chunk_text, v.page_number, v.chapter,
           v.topic, v.keywords, v.embedding, v.token_count, v.metadata]
        );
      }
      await client.query(
        `UPDATE ai_schema.books SET total_chunks = total_chunks + $1, embedding_status = 'indexed' WHERE id = $2`,
        [chunks.length, bookId]
      );
    } catch (e) {
      await client.query(
        `UPDATE ai_schema.books SET embedding_status = 'failed' WHERE id = $1`, [bookId]
      );
      throw e;
    } finally {
      client.release();
    }
  }

  // ─── Retrieve Relevant Chunks ──────────────────────────────
  async retrieve(query, filters = {}, limit = 10) {
    const queryEmbedding = await embedder.embedQuery(query);
    if (!queryEmbedding) return [];

    const { grade, subject, bookId, chapter } = filters;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Full-text search as base filter
    conditions.push(`to_tsvector('english', chunk_text) @@ plainto_tsquery('english', $${paramIndex})`);
    params.push(query);
    paramIndex++;

    if (grade) {
      conditions.push(`b.grade = $${paramIndex}`);
      params.push(grade);
      paramIndex++;
    }
    if (subject) {
      conditions.push(`b.subject = $${paramIndex}`);
      params.push(subject);
      paramIndex++;
    }
    if (bookId) {
      conditions.push(`bc.book_id = $${paramIndex}`);
      params.push(bookId);
      paramIndex++;
    }
    if (chapter) {
      conditions.push(`bc.chapter = $${paramIndex}`);
      params.push(chapter);
      paramIndex++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const embeddingStr = queryEmbedding ? `ARRAY[${queryEmbedding.join(',')}]::double precision[]` : 'NULL';

    const sql = `
      SELECT bc.id, bc.chunk_text, bc.chunk_index, bc.page_number, bc.chapter, bc.keywords,
             b.id as book_id, b.title as book_name, b.grade, b.subject,
             ts_rank(to_tsvector('english', bc.chunk_text), plainto_tsquery('english', $1)) as similarity
      FROM ai_schema.book_chunks bc
      JOIN ai_schema.books b ON b.id = bc.book_id
      ${whereClause}
      ORDER BY similarity DESC
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const result = await db.query(sql, params);
    return result.rows.map(r => ({
      ...r,
      similarity: r.similarity ? Math.max(0, Math.min(1, parseFloat(r.similarity))) : 0
    }));
  }

  // ─── Retrieve by Grade/Subject Only (no full-text) ──────
  async retrieveByBook(filters = {}, limit = 10) {
    const { grade, subject, bookId } = filters;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (grade) { conditions.push(`b.grade = $${idx++}`); params.push(grade); }
    if (subject) { conditions.push(`b.subject = $${idx++}`); params.push(subject); }
    if (bookId) { conditions.push(`bc.book_id = $${idx++}`); params.push(bookId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT bc.id, bc.chunk_text, bc.chunk_index, bc.page_number, bc.chapter, bc.keywords,
             b.id as book_id, b.title as book_name, b.grade, b.subject, 0.5 as similarity
      FROM ai_schema.book_chunks bc
      JOIN ai_schema.books b ON b.id = bc.book_id
      ${where}
      ORDER BY bc.created_at DESC
      LIMIT $${idx}
    `;
    params.push(limit);

    const result = await db.query(sql, params);
    return result.rows.map(r => ({
      ...r,
      similarity: r.similarity ? Math.max(0, Math.min(1, parseFloat(r.similarity))) : 0.5
    }));
  }

  // ─── Build Context from Chunks ─────────────────────────────
  buildContext(chunks) {
    if (!chunks || chunks.length === 0) return { context: '', sources: [] };

    const seen = new Set();
    const names = [];
    let context = '\n\n[REFERENCE MATERIALS]\n';

    for (const chunk of chunks) {
      if (!chunk.chunk_text || chunk.similarity < 0.15) continue;
      const bookKey = `${chunk.book_name}|${chunk.chapter || ''}|${chunk.page_number || ''}`;
      if (!seen.has(bookKey)) {
        seen.add(bookKey);
        names.push({
          book: chunk.book_name,
          chapter: chunk.chapter,
          page: chunk.page_number,
          similarity: chunk.similarity
        });
      }
      context += `\n--- Source: "${chunk.book_name}"`;
      if (chunk.chapter) context += ` | Chapter: ${chunk.chapter}`;
      if (chunk.page_number) context += ` | Page: ${chunk.page_number}`;
      context += ` ---\n${chunk.chunk_text}\n`;
    }

    context += '\n[/END REFERENCE MATERIALS]\n';
    context += 'CRITICAL: Use ONLY the above reference materials. Do NOT use outside knowledge.';
    context += ' If the answer is not found in the references, say "I could not find this information in the uploaded books."';
    context += ' Always cite the specific book, chapter, and page number for each fact.';

    return { context, sources: names };
  }

  // ─── Log Retrieval ─────────────────────────────────────────
  async logRetrieval({ query, chunkIds, count, avgSim, timeMs, teacherId, feature }) {
    try {
      await db.query(
        `INSERT INTO ai_schema.retrieval_logs
         (query_text, retrieved_chunk_ids, total_chunks_retrieved, avg_similarity, response_time_ms, teacher_id, feature)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [query, chunkIds, count, avgSim, timeMs, teacherId || 0, feature || 'search']
      );
    } catch {} // non-critical
  }
}

module.exports = new RAGPipeline();
