// Embedding service — generates vector embeddings for text
// Uses local sentence-transformers via Python bridge, or OpenAI-compatible API

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const EMBEDDING_DIM = 384; // all-MiniLM-L6-v2 dimension

class EmbeddingService {
  constructor() {
    this.provider = process.env.AI_EMBEDDING_MODEL || 'local';
    this.cache = new Map();
  }

  async embedText(text) {
    if (!text || text.trim().length === 0) return null;

    const cacheKey = `emb_${Buffer.from(text).toString('base64').slice(0, 64)}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    let vector;
    if (this.provider === 'openai') {
      vector = await this._embedOpenAI(text);
    } else {
      vector = await this._embedLocal(text);
    }

    if (vector) this.cache.set(cacheKey, vector);
    return vector;
  }

  async embedBatch(texts) {
    const results = [];
    for (const text of texts) {
      const vec = await this.embedText(text);
      results.push(vec);
    }
    return results;
  }

  async embedQuery(text) {
    return this.embedText(text);
  }

  _embedLocal(text) {
    return new Promise((resolve, reject) => {
      try {
        // Attempt to call a local Python embedding script
        const scriptPath = path.join(__dirname, '..', 'scripts', 'embed.py');
        if (!fs.existsSync(scriptPath)) {
          // Fallback: generate a deterministic pseudo-embedding for dev/testing
          return resolve(this._mockEmbedding(text));
        }
        const result = execSync(`python "${scriptPath}" "${text.replace(/"/g, '\\"')}"`, {
          timeout: 10000,
          encoding: 'utf-8'
        });
        resolve(JSON.parse(result.trim()));
      } catch {
        resolve(this._mockEmbedding(text));
      }
    });
  }

  async _embedOpenAI(text) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text
        })
      });
      if (!response.ok) throw new Error(`OpenAI embedding error: ${await response.text()}`);
      const data = await response.json();
      return data?.data?.[0]?.embedding || null;
    }
    return this._mockEmbedding(text);
  }

  _mockEmbedding(text) {
    // Deterministic pseudo-embedding for development
    const seed = Buffer.from(text).reduce((a, b) => a + b, 0);
    const vec = new Array(EMBEDDING_DIM).fill(0);
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vec[i] = Math.sin(seed + i * 0.1) * 0.5 + Math.cos(seed * 0.5 + i * 0.05) * 0.3;
    }
    // Normalize
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return vec.map(v => v / mag);
  }
}

module.exports = new EmbeddingService();
