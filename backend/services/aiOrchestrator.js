// AI Orchestrator — coordinates RAG + DeepSeek + History for all AI features
const rag = require('./ragPipeline');
const { generateJSON } = require('./deepseekClient');
const db = require('../config/db');
const crypto = require('crypto');

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cache = new Map();

const ERROR_TYPES = {
  no_context: {
    type: 'no_context', title: 'No Content Found',
    description: 'No matching content found in your uploaded books for this topic.',
    action: 'upload_books', link: '/ai/books/upload', icon: 'book'
  },
  low_confidence: {
    type: 'low_confidence', title: 'Low Confidence Response',
    description: 'The AI could not generate a sufficiently grounded response. The retrieved materials may not contain enough information.',
    action: 'upload_more', link: '/ai/books/upload', icon: 'alert'
  }
};

class AIOrchestrator {
  async generate({ feature, promptBuilder, params, teacherId, filters }) {
    const startTime = Date.now();

    // 1. Retrieve RAG context — try topic-specific first
    let chunks = await rag.retrieve(
      params.topic || params.query || '',
      filters || { grade: params.grade, subject: params.subject },
      10
    );
    let { context, sources } = rag.buildContext(chunks);

    // 2. Fallback: no topic match → use grade/subject books only
    if (!context || chunks.length === 0) {
      console.log(`[RAG Fallback] No topic match for "${params.topic}", using grade/subject: ${params.grade}/${params.subject}`);
      chunks = await rag.retrieveByBook(
        filters || { grade: params.grade, subject: params.subject },
        10
      );
      const result = rag.buildContext(chunks);
      context = result.context;
      sources = result.sources;
    }

    // 3. Check for any context at all
    if (!context || chunks.length === 0) {
      return { success: false, ...ERROR_TYPES.no_context, sources: [] };
    }

    // 3. Build prompt
    const prompt = promptBuilder(params) + context;

    // 4. Check cache
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    const cached = getFromCache(cacheKey);
    if (cached) return { ...cached, fromCache: true };

    // 5. Call DeepSeek
    const output = await generateJSON(prompt);

    // 6. Post-generation hallucination validation
    const validation = validateOutput(output, sources, chunks);
    if (validation.warnings.length > 0) {
      console.warn(`[Hallucination Guard] ${validation.warnings.length} warning(s) for feature=${feature}:`, validation.warnings);
    }

    // Skip strict validation for mock mode (mock data doesn't reference real chunks)
    const confidenceThreshold = process.env.MOCK_AI === 'true' ? 0.01 : 0.3;
    if (validation.score < confidenceThreshold) {
      return { success: false, ...ERROR_TYPES.low_confidence, sources, validation };
    }

    // 7. Save to history
    const genId = await this.saveGeneration({
      teacherId, feature, params, prompt, sources, output,
      tokenCount: 0, responseTimeMs: Date.now() - startTime,
      confidence: validation.score
    });

    const result = {
      success: true,
      data: { ...output, id: genId, confidence: validation.score, validation },
      sources,
      generatedAt: new Date().toISOString()
    };

    setCache(cacheKey, result);
    return result;
  }

  async saveGeneration({ teacherId, feature, params, prompt, sources, output, tokenCount, responseTimeMs, confidence }) {
    // Save output to feature-specific table
    try {
      const genResult = await db.query(
        `INSERT INTO ai_schema.generations
         (teacher_id, feature, grade, subject, topic, prompt_text, retrieved_sources, generated_output, confidence, token_count, response_time_ms)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [teacherId || 0, feature, params.grade || '', params.subject || '',
         params.topic || params.query || '', prompt,
         JSON.stringify(sources), JSON.stringify(output), confidence || 0,
         tokenCount || 0, responseTimeMs || 0]
      );
      return genResult.rows[0].id;
    } catch (e) {
      console.error('Save generation error:', e.message);
      return null;
    }
  }

  async chat({ query, teacherId, filters }) {
    const startTime = Date.now();
    const chunks = await rag.retrieve(query, filters || {}, 5);
    const { context, sources } = rag.buildContext(chunks);

    if (!context || chunks.length === 0) {
      return {
        answer: 'I could not find this information in the uploaded books.',
        sources: [],
        confidence: 0
      };
    }

    const promptBuilders = require('./promptBuilders');
    const prompt = promptBuilders.buildChatPrompt(query, context);
    const output = await generateJSON(prompt);

    return {
      ...output,
      sources,
      generatedAt: new Date().toISOString()
    };
  }
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

// ─── Hallucination Validation ──────────────────────────────────
function validateOutput(output, sources, chunks) {
  const warnings = [];
  const outputStr = JSON.stringify(output).toLowerCase();
  const sourceBooks = sources.map(s => s.book.toLowerCase());
  const sourceChunks = chunks.map(c => c.chunk_text.toLowerCase());

  // Check if output contains source references
  const hasSources = sources.length > 0;
  if (!hasSources) {
    warnings.push('No source references found in the generated output');
  }

  // Check if output text overlaps with retrieved chunks
  let overlapScore = 0;
  const outputWords = new Set(outputStr.split(/\s+/));
  for (const chunk of sourceChunks) {
    const chunkWords = new Set(chunk.split(/\s+/));
    let matches = 0;
    for (const word of outputWords) {
      if (word.length > 3 && chunkWords.has(word)) matches++;
    }
    const ratio = matches / Math.max(outputWords.size, 1);
    if (ratio > overlapScore) overlapScore = ratio;
  }

  // Confidence score based on overlap
  const confidenceThresholds = [
    { min: 0.4, score: 0.95 },  // Strong overlap
    { min: 0.3, score: 0.85 },
    { min: 0.2, score: 0.70 },
    { min: 0.1, score: 0.50 },
    { min: 0.05, score: 0.30 },
    { min: 0, score: 0.10 }
  ];

  let baseScore = confidenceThresholds.find(t => overlapScore >= t.min)?.score || 0.1;

  // Deduct for missing source citations
  const citationCount = (outputStr.match(/"book"/g) || []).length;
  if (citationCount === 0 && sources.length > 0) {
    warnings.push('Output does not contain explicit book citations');
    baseScore *= 0.7;
  }

  // Normalize score
  const finalScore = Math.max(0, Math.min(1, baseScore));

  return {
    score: finalScore,
    overlapScore,
    hasSources,
    citationCount,
    warnings
  };
}

module.exports = new AIOrchestrator();
