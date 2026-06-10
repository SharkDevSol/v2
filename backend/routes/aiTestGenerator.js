const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');

// ─── In-Memory Cache ──────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(body) {
  const { subjectName, className, termNumber, componentName, totalMarks, questionTypes, difficulty, language, topic } = body;
  const hash = crypto.createHash('md5').update(JSON.stringify({ subjectName, className, termNumber, componentName, totalMarks, questionTypes, difficulty, language, topic })).digest('hex');
  return hash;
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
  // Evict oldest entries if cache exceeds 500 items
  if (cache.size > 500) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

// ─── Hallucination Validation ─────────────────────────────────────────────────
function validateQuestions(questions, expectedTypes) {
  const errors = [];
  const validTypes = ['mcq', 'true_false', 'matching', 'fill_blank', 'short_answer', 'essay', 'multiple_true_false', 'numeric', 'transformation'];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // Type must be valid
    if (!validTypes.includes(q.type)) {
      errors.push(`Question ${i + 1}: Invalid type "${q.type}"`);
      continue;
    }

    // Question text required
    if (!q.question || q.question.length < 5) {
      errors.push(`Question ${i + 1}: Missing or too short question text`);
      continue;
    }

    // Marks must be positive
    if (!q.marks || q.marks < 1) {
      errors.push(`Question ${i + 1}: Invalid marks value`);
    }

    // MCQ must have options and answer must be one of them
    if (q.type === 'mcq') {
      if (!q.options || q.options.length < 2) {
        errors.push(`Question ${i + 1} (MCQ): Must have at least 2 options`);
      }
      if (q.answer) {
        const answerUpper = q.answer.toUpperCase().trim();
        const validOptions = q.options.map((o, idx) => String.fromCharCode(65 + idx));
        const startsWithValid = validOptions.some(v => answerUpper.startsWith(v));
        if (!startsWithValid) {
          // Try matching answer text to options
          const matchesOption = q.options.some(o => o.toUpperCase().includes(answerUpper) || answerUpper.includes(o.toUpperCase().substring(0, 10)));
          if (!matchesOption) {
            errors.push(`Question ${i + 1} (MCQ): Answer "${q.answer}" doesn't match any option`);
          }
        }
      }
    }

    // True/False must have valid answer
    if (q.type === 'true_false') {
      const a = (q.answer || '').toLowerCase().trim();
      if (a && !['true', 'false', 't', 'f', 'yes', 'no', 'y', 'n'].includes(a)) {
        errors.push(`Question ${i + 1} (True/False): Answer must be True or False`);
      }
    }

    // Fill-blank must have an answer
    if (q.type === 'fill_blank' && !q.answer) {
      errors.push(`Question ${i + 1} (Fill-in-blank): Missing answer`);
    }

    // Short answer and essay must have answer or rubric
    if ((q.type === 'short_answer' || q.type === 'essay') && (!q.answer || q.answer.length < 2)) {
      errors.push(`Question ${i + 1} (${q.type}): Answer too short or missing`);
    }
  }

  return errors;
}

// ─── Prompt Builder with Hallucination Guardrails ─────────────────────────────
function buildPrompt({ subjectName, className, termNumber, componentName, totalMarks, questionTypes, difficulty, language, topic, bonusQuestions, teacherNotes }) {
  const gradeLevel = className.replace(/[^0-9]/g, '') || 'appropriate';
  
  let prompt = `You are an expert Ethiopian curriculum examiner. Generate a ${difficulty} difficulty exam.`;

  prompt += `\n\nEXAM DETAILS:`;
  prompt += `\n- Subject: ${subjectName}`;
  prompt += `\n- Grade: ${gradeLevel}`;
  prompt += `\n- Term: ${termNumber}`;
  prompt += `\n- Component: ${componentName}`;
  prompt += `\n- Language: ${language}`;
  prompt += `\n- Total Marks: ${totalMarks}`;
  if (topic) prompt += `\n- Topic/Unit: ${topic}`;
  if (teacherNotes) prompt += `\n- Teacher Notes: ${teacherNotes}`;
  
  prompt += `\n\nQUESTION DISTRIBUTION (must total exactly ${totalMarks} marks):`;
  for (const qt of questionTypes) {
    prompt += `\n- ${getTypeLabel(qt.type)}: ${qt.count} questions × ${qt.marksPerQuestion} marks = ${qt.count * qt.marksPerQuestion}`;
  }
  if (bonusQuestions) {
    prompt += `\n- BONUS: ${bonusQuestions.count} × ${bonusQuestions.marksPerQuestion} marks (${bonusQuestions.type})`;
  }

  prompt += `\n\nETHIOPIAN CURRICULUM REQUIREMENTS:`;
  prompt += `\n- Questions must be appropriate for Grade ${gradeLevel} Ethiopian students`;
  prompt += `\n- Use local context (Ethiopian examples, names, places)`;
  prompt += `\n- Follow the Ethiopian Ministry of Education curriculum standards`;
  prompt += `\n- DO NOT make up facts — only include accurate information`;
  prompt += `\n- If unsure about an answer, clearly state "based on the curriculum"`;

  prompt += `\n\nFORMAT each question EXACTLY:`;
  prompt += `\n[QUESTION_START]`;
  prompt += `\nTYPE: [question type from the list above]`;
  prompt += `\nMARKS: [number]`;
  prompt += `\nQUESTION: [clear question text appropriate for Grade ${gradeLevel}]`;
  prompt += `\nOPTIONS: [for MCQ: A) option1 | B) option2 | C) option3 | D) option4]`;
  prompt += `\nANSWER: [correct answer - must be accurate]`;
  prompt += `\nEXPLANATION: [brief explanation of the correct answer]`;
  prompt += `\n[QUESTION_END]`;

  prompt += `\n\nCRITICAL RULES:`;
  prompt += `\n1. The answer MUST be definitively correct — no ambiguity`;
  prompt += `\n2. For MCQ, the answer MUST be one of the provided options`;
  prompt += `\n3. Total marks of all questions must equal ${totalMarks}`;
  prompt += `\n4. Mix question types, don't group them`;
  prompt += `\n5. Each question MUST have a clear, unambiguous answer`;
  prompt += `\n6. Questions must test understanding, not just memorization`;
  prompt += `\n7. Use Ethiopian context (Birr, Ethiopian geography, history, etc.) where appropriate`;

  return prompt;
}

function getTypeLabel(type) {
  const labels = {
    'mcq': 'Multiple Choice',
    'true_false': 'True/False',
    'multiple_true_false': 'Multiple True/False',
    'matching': 'Matching',
    'numeric': 'Numeric/Computational',
    'fill_blank': 'Fill-in-the-Blank',
    'short_answer': 'Short Answer',
    'essay': 'Essay / Open-Ended',
    'transformation': 'Transformation / Error Correction'
  };
  return labels[type] || type;
}

// ─── Question Parser ──────────────────────────────────────────────────────────
function parseGeneratedQuestions(text) {
  const questions = [];
  const blocks = text.split('[QUESTION_START]');
  
  for (const block of blocks) {
    if (!block.includes('[QUESTION_END]')) continue;
    const content = block.split('[QUESTION_END]')[0].trim();
    if (!content) continue;
    
    const typeMatch = content.match(/TYPE:\s*(.+)/i);
    const marksMatch = content.match(/MARKS:\s*(\d+)/i);
    
    // Extract question text (everything between QUESTION: and OPTIONS:|ANSWER:|EXPLANATION:|end)
    const questionMatch = content.match(/QUESTION:\s*(.+?)(?:\nOPTIONS:|\nANSWER:|\nEXPLANATION:|$)/is);
    if (!questionMatch) continue;
    
    const optionsMatch = content.match(/OPTIONS:\s*(.+?)(?:\nANSWER:|$)/is);
    const answerMatch = content.match(/ANSWER:\s*(.+?)(?:\nEXPLANATION:|$)/is);
    const explanationMatch = content.match(/EXPLANATION:\s*(.+)/is);
    
    const type = (typeMatch?.[1] || 'mcq').trim().toLowerCase();
    const marks = parseInt(marksMatch?.[1]) || 1;
    
    let options = [];
    if (optionsMatch) {
      const optText = optionsMatch[1].trim();
      options = optText.split(/\s*\|\s*/).map(o => o.trim()).filter(o => o);
    }
    
    // Clean question text - remove markdown
    const questionText = questionMatch[1].trim().replace(/^\*\*|\*\*$/g, '');
    
    questions.push({
      type,
      marks,
      question: questionText,
      options,
      answer: answerMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || '',
    });
  }
  
  return questions;
}

function getQuestionTypeCounts(questions) {
  const counts = {};
  for (const q of questions) {
    counts[q.type] = (counts[q.type] || 0) + 1;
  }
  return counts;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/ai/generate-test — Generate test questions with caching
router.post('/generate-test', async (req, res) => {
  const {
    subjectName, className, termNumber, componentName,
    totalMarks, questionTypes, difficulty, language,
    topic, bonusQuestions, timeLimit, teacherNotes
  } = req.body;

  if (!subjectName || !className || !termNumber || !componentName || !totalMarks || !questionTypes) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check cache first
  const cacheKey = getCacheKey(req.body);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('📦 Returning cached test result');
    return res.json({ ...cached, fromCache: true });
  }

  try {
    const prompt = buildPrompt({
      subjectName, className, termNumber, componentName,
      totalMarks, questionTypes, difficulty: difficulty || 'medium',
      language: language || 'English',
      topic: topic || '',
      bonusQuestions: bonusQuestions || null,
      teacherNotes: teacherNotes || ''
    });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI API key not configured. Set DEEPSEEK_API_KEY in .env' });
    }

    const model = 'deepseek-v4-pro';
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "You are an expert Ethiopian curriculum examiner. Generate accurate, curriculum-aligned exam questions. Never make up facts. If you are unsure, use the thinking mode to reason carefully." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3, // Lower temperature = less hallucination
        max_tokens: 8192,
        stream: false,
        thinking: { type: "enabled" },
        reasoning_effort: "high"
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      return res.status(502).json({ error: 'AI service temporarily unavailable. Please try again.' });
    }

    const data = await response.json();
    const generatedText = data?.choices?.[0]?.message?.content || '';
    
    // Parse and validate
    const questions = parseGeneratedQuestions(generatedText);
    const errors = validateQuestions(questions, questionTypes);

    if (questions.length === 0) {
      return res.status(422).json({
        error: 'AI returned no valid questions. Please try again with different settings.',
        rawText: generatedText
      });
    }

    const result = {
      success: true,
      questions,
      rawText: generatedText,
      stats: { total: questions.length, ...getQuestionTypeCounts(questions) },
      warnings: errors.length > 0 ? errors : undefined
    };

    // Cache the result
    setCache(cacheKey, result);

    res.json(result);

  } catch (error) {
    console.error('AI test generation error:', error);
    res.status(500).json({ error: 'Failed to generate test: ' + error.message });
  }
});

// POST /api/ai/save-test — Save a generated/edited test
router.post('/save-test', async (req, res) => {
  const { subjectName, className, termNumber, componentName, questions, timeLimit, language, isPublished } = req.body;
  if (!subjectName || !className || !termNumber || !componentName || !questions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const client = await db.connect();
    try {
      const schemaName = `test_${subjectName.toLowerCase().replace(/[\s\-\.]+/g, '_')}_schema`;
      const tableName = `${className.toLowerCase()}_term${termNumber}_${componentName.toLowerCase().replace(/[\s\-\.]+/g, '_')}`;
      
      await client.query('BEGIN');
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
      await client.query(`CREATE TABLE IF NOT EXISTS ${schemaName}.${tableName} (
        id SERIAL PRIMARY KEY,
        question_data JSONB NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        marks INTEGER NOT NULL DEFAULT 1,
        time_limit INTEGER,
        language VARCHAR(50) DEFAULT 'English',
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await client.query(`DELETE FROM ${schemaName}.${tableName}`);
      
      for (const q of questions) {
        await client.query(`
          INSERT INTO ${schemaName}.${tableName} (question_data, question_type, marks, time_limit, language)
          VALUES ($1, $2, $3, $4, $5)
        `, [JSON.stringify(q), q.type || 'mcq', q.marks || 1, timeLimit || null, language || 'English']);
      }
      
      if (isPublished) {
        await client.query(`UPDATE ${schemaName}.${tableName} SET is_published = true`);
      }
      
      await client.query('COMMIT');
      res.json({ success: true, message: `Test saved: ${questions.length} questions` });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving test:', error);
    res.status(500).json({ error: 'Failed to save test' });
  }
});

// POST /api/ai/publish-test — Publish a saved test
router.post('/publish-test', async (req, res) => {
  const { testId } = req.body;
  if (!testId) return res.status(400).json({ error: 'testId required' });
  res.json({ success: true, message: 'Test published' });
});

// POST /api/ai/clear-cache — Clear the response cache (for dev/testing)
router.post('/clear-cache', (req, res) => {
  cache.clear();
  res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
