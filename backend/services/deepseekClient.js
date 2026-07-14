const crypto = require('crypto');

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';

function callDeepSeek(prompt, options = {}) {
  if (process.env.MOCK_AI === 'true') {
    const mock = require('./mockData');
    return mock.getMockResponse(prompt);
  }
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }
  return fetch(DEEPSEEK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: options.model || 'deepseek-v4-pro',
      messages: [
        { role: "system", content: options.systemPrompt || "You are Skoolific AI, an expert Ethiopian educator assistant. Generate accurate, curriculum-aligned educational materials." },
        { role: "user", content: prompt }
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens || 8192,
      stream: options.stream || false,
      thinking: { type: "enabled" },
      reasoning_effort: "high"
    })
  });
}

async function generateJSON(prompt, options = {}) {
  const response = await callDeepSeek(prompt, options);
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${err}`);
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';
  return JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
}

async function generateStream(prompt, onChunk, options = {}) {
  const response = await callDeepSeek(prompt, { ...options, stream: true });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek stream error: ${err}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = line.slice(6).trim();
        if (json === '[DONE]') return;
        try {
          const parsed = JSON.parse(json);
          const content = parsed?.choices?.[0]?.delta?.content || '';
          if (content) onChunk(content);
        } catch {}
      }
    }
  }
}

module.exports = { callDeepSeek, generateJSON, generateStream };
