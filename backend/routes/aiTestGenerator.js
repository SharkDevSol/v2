const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');
const { authenticateWithBranch } = require('../middleware/branchAuth');

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

// GET /api/ai/get-test — Fetch questions for a saved test
router.get('/get-test', async (req, res) => {
  try {
    const { subject, className, termNumber, componentName } = req.query;
    if (!subject || !className || !termNumber || !componentName) {
      return res.status(400).json({ error: 'Missing required query params: subject, className, termNumber, componentName' });
    }
    const schemaName = `test_${subject.toLowerCase().replace(/[\s\-\.]+/g, '_')}_schema`;
    const tableName = `${className.toLowerCase()}_term${termNumber}_${componentName.toLowerCase().replace(/[\s\-\.]+/g, '_')}`;

    // Check if table exists
    const exists = await db.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='${schemaName}' AND table_name='${tableName}')`);
    if (!exists.rows[0].exists) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const result = await db.query(`SELECT id, question_data, question_type, marks, time_limit, language FROM "${schemaName}"."${tableName}" ORDER BY id`);
    const questions = result.rows.map(r => ({
      id: r.id,
      ...r.question_data,
      type: r.question_type,
      marks: r.marks,
    }));

    res.json({ success: true, data: { subject, className, termNumber, componentName, questions, totalMarks: questions.reduce((s, q) => s + q.marks, 0) } });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test', details: error.message });
  }
});

// POST /api/ai/publish-test — Publish a saved test to students
router.post('/publish-test', async (req, res) => {
  const { testId, className, subjectName, termNumber, componentName } = req.body;
  if (!testId) return res.status(400).json({ error: 'testId required' });
  try {
    await pool.query(`UPDATE ai_exams SET status='published', published_at=NOW() WHERE id=$1`, [testId]);
    console.log(`📢 Test ${testId} published for ${className || 'all students'}`);
    res.json({ success: true, message: 'Test published to students' });
  } catch(e) {
    res.status(500).json({ error: 'Failed to publish: ' + e.message });
  }
});

// POST /api/ai/submit-exam — Student submits exam for auto-grading
router.post('/submit-exam', async (req, res) => {
  const { examId, studentId, studentName, className, answers } = req.body;
  if (!examId || !answers) return res.status(400).json({ error: 'examId and answers required' });

  try {
    // Fetch the correct answers
    const exam = await pool.query('SELECT output FROM ai_content WHERE id=$1', [examId]);
    if (!exam.rows.length) return res.status(404).json({ error: 'Exam not found' });

    const output = typeof exam.rows[0].output === 'string' ? JSON.parse(exam.rows[0].output) : exam.rows[0].output;
    const questions = output?.exam?.questions || output?.test?.questions?.[0]?.questions || [];
    if (!questions.length) return res.status(400).json({ error: 'No questions found in exam' });

    // Auto-grade objective questions
    let totalMarks = 0, obtainedMarks = 0;
    const results = [];

    for (const q of questions) {
      const studentAnswer = answers[q.id?.toString()] || answers[q.id] || '';
      const correct = q.correctAnswer || q.answer || '';
      let isCorrect = false;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        isCorrect = studentAnswer.toString().trim().toUpperCase() === correct.toString().trim().toUpperCase();
      } else if (q.type === 'fill_blank') {
        isCorrect = studentAnswer.toString().trim().toLowerCase() === correct.toString().trim().toLowerCase();
      } else if (q.type === 'numeric') {
        isCorrect = Math.abs(parseFloat(studentAnswer) - parseFloat(correct)) < 0.01;
      }
      // short_answer and essay are manual

      const marks = q.marks || 1;
      totalMarks += marks;
      if (isCorrect) obtainedMarks += marks;

      results.push({
        questionId: q.id,
        type: q.type,
        studentAnswer,
        correctAnswer: correct,
        isCorrect,
        marks: isCorrect ? marks : 0,
        maxMarks: marks
      });
    }

    // Save results
    await pool.query(
      `INSERT INTO exam_results (exam_id, student_id, student_name, class_name, answers, results, total_marks, obtained_marks, auto_graded, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [examId, studentId || 'guest', studentName || 'Unknown', className || '',
       JSON.stringify(answers), JSON.stringify(results), totalMarks, obtainedMarks, true]
    );

    res.json({
      success: true,
      obtainedMarks, totalMarks,
      percentage: totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0,
      results,
      message: `You scored ${obtainedMarks}/${totalMarks}`
    });
  } catch(e) {
    console.error('Auto-grading error:', e);
    res.status(500).json({ error: 'Grading failed: ' + e.message });
  }
});

// GET /api/ai/list-tests — List all saved tests
router.get('/list-tests', async (req, res) => {
  try {
    const schemas = await db.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'test_%' ORDER BY schema_name");
    const tests = [];
    for (const s of schemas.rows) {
      const tables = await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='${s.schema_name}'`);
      for (const t of tables.rows) {
        const count = await db.query(`SELECT COUNT(*) as c FROM "${s.schema_name}"."${t.table_name}"`);
        const subject = s.schema_name.replace('test_', '').replace('_schema', '').replace(/_/g, ' ');
        tests.push({
          id: `${s.schema_name}.${t.table_name}`,
          subject: subject.charAt(0).toUpperCase() + subject.slice(1),
          className: t.table_name.split('_term')[0],
          termNumber: t.table_name.match(/term(\d+)/)?.[1] || '1',
          componentName: t.table_name.split('_').pop(),
          questionCount: parseInt(count.rows[0].c)
        });
      }
    }
    res.json({ success: true, data: tests });
  } catch (error) {
    console.error('Error listing tests:', error);
    res.status(500).json({ error: 'Failed to list tests' });
  }
});

// POST /api/ai/clear-cache — Clear the response cache (for dev/testing)
router.post('/clear-cache', (req, res) => {
  cache.clear();
  res.json({ success: true, message: 'Cache cleared' });
});

// ─── Lesson Plan Builder Functions ─────────────────────────────────────────────
function buildLessonPlanPrompt({ topic, grade, subject, chapter, duration, language }) {
  return `You are an expert Ethiopian educator creating a detailed, classroom-ready lesson plan.

LESSON DETAILS:
- Subject: ${subject}
- Grade: ${grade}
- Topic: ${topic}${chapter ? `\n- Chapter: ${chapter}` : ''}
- Duration: ${duration || 40} minutes
- Language: ${language || 'English'}

Generate a professional lesson plan with the following structure. Return your response as a JSON object with EXACTLY this structure:
{
  "lessonPlan": {
    "title": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",${chapter ? `\n    "chapter": "${chapter}",` : ''}
    "duration": "${duration || 40} minutes",
    "learningObjectives": ["objective 1 - measurable", "objective 2 - measurable", "objective 3 - measurable"],
    "requiredMaterials": ["material 1", "material 2"],
    "introduction": "engaging introduction paragraph (5 min)",
    "mainActivities": [
      { "step": 1, "duration": "10 min", "teacherActivity": "what teacher does", "studentActivity": "what students do" },
      { "step": 2, "duration": "10 min", "teacherActivity": "what teacher does", "studentActivity": "what students do" },
      { "step": 3, "duration": "10 min", "teacherActivity": "what teacher does", "studentActivity": "what students do" }
    ],
    "assessmentMethods": "how learning is assessed",
    "discussionQuestions": ["question 1", "question 2"],
    "summary": "wrap-up paragraph (5 min)",
    "homework": "homework assignment",
    "teacherNotes": "notes for the teacher"
  }
}

CRITICAL RULES:
1. Content must be appropriate for Grade ${grade} Ethiopian students following the national curriculum
2. Use Ethiopian context (names, places, examples) where appropriate
3. Learning objectives must be measurable and observable
4. Time allocations must be realistic for a real classroom
5. Activities must be practical and age-appropriate
6. Return ONLY valid JSON — no markdown, no extra text
7. Never make up facts — only include accurate educational content`;
}

function buildLessonNotePrompt({ topic, grade, subject, chapter, language }) {
  return `You are an expert Ethiopian educator creating detailed teacher lesson notes.

LESSON NOTE DETAILS:
- Subject: ${subject}
- Grade: ${grade}
- Topic: ${topic}${chapter ? `\n- Chapter: ${chapter}` : ''}
- Language: ${language || 'English'}

Generate comprehensive teacher lesson notes. Return your response as a JSON object with EXACTLY this structure:
{
  "lessonNote": {
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",${chapter ? `\n    "chapter": "${chapter}",` : ''}
    "objectives": ["objective 1", "objective 2", "objective 3"],
    "keyConcepts": [
      { "term": "concept name", "definition": "age-appropriate definition" }
    ],
    "mainExplanation": "detailed explanation of the topic in student-friendly language",
    "examples": [
      { "problem": "example question or scenario", "solution": "step-by-step solution" }
    ],
    "classroomActivities": [
      { "activity": "activity name", "instructions": "step-by-step instructions", "duration": "time" }
    ],
    "importantNotes": ["common mistakes to avoid", "key points to emphasize"],
    "summary": "concise summary of the lesson",
    "reviewQuestions": [
      { "question": "review question", "expectedAnswer": "correct answer" }
    ]
  }
}

CRITICAL RULES:
1. Content must be appropriate for Grade ${grade} Ethiopian students
2. Use Ethiopian context (names, places, examples) where appropriate
3. Explanations must be clear, student-friendly, and educationally sound
4. Key concepts must have accurate definitions
5. Return ONLY valid JSON — no markdown, no extra text
6. Never make up facts — only include accurate educational content`;
}

function callDeepSeek(prompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key not configured. Set DEEPSEEK_API_KEY in .env');
  }
  if (process.env.MOCK_AI === 'true') {
    return getMockResponse(prompt);
  }
  return fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-v4-pro',
      messages: [
        { role: "system", content: "You are Skoolific AI, an expert Ethiopian educator assistant. Generate accurate, curriculum-aligned educational materials. Never make up facts." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 8192,
      stream: false,
      thinking: { type: "enabled" },
      reasoning_effort: "high"
    })
  });
}

// POST /api/ai/generate-lesson-plan — Generate a lesson plan using DeepSeek
router.post('/generate-lesson-plan', async (req, res) => {
  const { topic, grade, subject, chapter, duration, language } = req.body;
  if (!topic || !grade || !subject) {
    return res.status(400).json({ error: 'Missing required fields: topic, grade, subject' });
  }

  try {
    const prompt = buildLessonPlanPrompt({ topic, grade, subject, chapter, duration, language });
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const response = await callDeepSeek(prompt);
    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', err);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const json = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));

    const result = { success: true, data: json };
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Lesson plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate lesson plan: ' + error.message });
  }
});

// POST /api/ai/generate-lesson-note — Generate a lesson note using DeepSeek
router.post('/generate-lesson-note', async (req, res) => {
  const { topic, grade, subject, chapter, language } = req.body;
  if (!topic || !grade || !subject) {
    return res.status(400).json({ error: 'Missing required fields: topic, grade, subject' });
  }

  try {
    const prompt = buildLessonNotePrompt({ topic, grade, subject, chapter, language });
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const response = await callDeepSeek(prompt);
    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', err);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const json = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));

    const result = { success: true, data: json };
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Lesson note generation error:', error);
    res.status(500).json({ error: 'Failed to generate lesson note: ' + error.message });
  }
});

// ─── Homework Prompt Builder ──────────────────────────────────────────────────
function buildHomeworkPrompt({ topic, grade, subject, chapter, difficulty, language, questionTypes, count }) {
  const types = questionTypes || ['multiple_choice', 'short_answer', 'true_false', 'fill_blank'];
  return `You are an expert Ethiopian educator creating a homework assignment.

HOMEWORK DETAILS:
- Subject: ${subject}
- Grade: ${grade}
- Topic: ${topic}${chapter ? `\n- Chapter: ${chapter}` : ''}
- Difficulty: ${difficulty || 'Medium'}
- Language: ${language || 'English'}
- Question Types: ${types.join(', ')}
- Number of questions per type: ${count || 5}

Generate a comprehensive homework assignment. Return JSON with EXACTLY this structure:
{
  "homework": {
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",
    "instructions": "clear instructions for students",
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "question text",
        "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
        "correctAnswer": "A",
        "explanation": "educational explanation"
      }
    ],
    "totalQuestions": number,
    "answerKey": "answer key for teacher reference"
  }
}

CRITICAL RULES:
1. Content appropriate for Grade ${grade} Ethiopian students
2. Use Ethiopian context (names, places, Birr, etc.)
3. ${types.includes('fill_blank') ? 'For fill_blank, use _____ (5 underscores)' : ''}
4. MCQ options: one clearly correct, three incorrect but plausible
5. Return ONLY valid JSON — no markdown, no extra text
6. Never make up facts`;
}

// ─── Worksheet Prompt Builder ────────────────────────────────────────────────
function buildWorksheetPrompt({ topic, grade, subject, chapter, language, activityTypes }) {
  const activities = activityTypes || ['exercises', 'matching', 'fill_blanks', 'identification'];
  return `You are an expert Ethiopian educator creating a classroom worksheet.

WORKSHEET DETAILS:
- Subject: ${subject}
- Grade: ${grade}
- Topic: ${topic}${chapter ? `\n- Chapter: ${chapter}` : ''}
- Language: ${language || 'English'}
- Activity Types: ${activities.join(', ')}

Generate a printable worksheet. Return JSON with EXACTLY this structure:
{
  "worksheet": {
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",
    "studentName": "____________________",
    "date": "____________________",
    "instructions": "general instructions",
    "sections": [
      {
        "title": "section title",
        "type": "exercises|matching|fill_blanks|identification",
        "instructions": "section-specific instructions",
        "questions": [
          { "id": 1, "question": "question text", "answer": "correct answer" }
        ]
      }
    ],
    "bonusChallenge": "optional extra challenge"
  }
}

CRITICAL RULES:
1. Content appropriate for Grade ${grade} Ethiopian students
2. Use Ethiopian context (names, places, examples)
3. Progressive difficulty within each section (easier → harder)
4. Return ONLY valid JSON — no markdown, no extra text
5. Never make up facts`;
}

// ─── Scramble Exam Prompt Builder ────────────────────────────────────────────
function buildScrambleExamPrompt({ topic, grade, subject, chapter, totalMarks, timeLimit, difficulty, language }) {
  return `You are an expert Ethiopian educator creating a comprehensive exam with 3 shuffled versions.

EXAM DETAILS:
- Subject: ${subject}
- Grade: ${grade}
- Topic: ${topic}${chapter ? `\n- Chapter: ${chapter}` : ''}
- Total Marks: ${totalMarks || 50}
- Time Limit: ${timeLimit || 60} minutes
- Difficulty: ${difficulty || 'Medium'}
- Language: ${language || 'English'}

Generate an exam with 3 versions (A, B, C) where questions and MCQ options are shuffled. Return JSON with EXACTLY this structure:
{
  "scrambleExam": {
    "title": "${topic} Exam",
    "grade": "${grade}",
    "subject": "${subject}",
    "totalMarks": ${totalMarks || 50},
    "timeLimit": ${timeLimit || 60},
    "instructions": "general exam instructions",
    "versions": {
      "A": { "label": "Version A", "sections": [ { "section": "A", "type": "multiple_choice", "questions": [ { "id": 1, "question": "text", "marks": number, "options": ["A. opt1","B. opt2","C. opt3","D. opt4"], "correctAnswer": "A", "explanation": "text" } ] } ] },
      "B": { "label": "Version B", "sections": [ ... same questions in DIFFERENT order, options SHUFFLED ] },
      "C": { "label": "Version C", "sections": [ ... same questions in DIFFERENT order, options SHUFFLED differently ] }
    },
    "answerKey": { "A": { "1": "A", "2": "False" }, "B": { "1": "D", "2": "True" }, "C": { "1": "B", "2": "True" } }
  }
}

CRITICAL RULES:
1. Content appropriate for Grade ${grade} Ethiopian students
2. Use Ethiopian context
3. All 3 versions must cover the SAME content at the SAME difficulty
4. Version B: reorder questions randomly, shuffle MCQ options
5. Version C: reorder differently from B, shuffle differently
6. Update correctAnswer to match shuffled options
7. Return ONLY valid JSON — no markdown, no extra text`;
}

// POST /api/ai/generate-homework — Generate homework using DeepSeek
router.post('/generate-homework', async (req, res) => {
  const { topic, grade, subject, chapter, difficulty, language, questionTypes, count } = req.body;
  if (!topic || !grade || !subject) return res.status(400).json({ error: 'topic, grade, subject required' });
  try {
    const prompt = buildHomeworkPrompt({ topic, grade, subject, chapter, difficulty, language, questionTypes, count });
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const response = await callDeepSeek(prompt);
    if (!response.ok) return res.status(502).json({ error: 'AI service temporarily unavailable' });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const json = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    const result = { success: true, data: json };
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Homework generation error:', error);
    res.status(500).json({ error: 'Failed to generate homework: ' + error.message });
  }
});

// POST /api/ai/generate-worksheet — Generate worksheet using DeepSeek
router.post('/generate-worksheet', async (req, res) => {
  const { topic, grade, subject, chapter, language, activityTypes } = req.body;
  if (!topic || !grade || !subject) return res.status(400).json({ error: 'topic, grade, subject required' });
  try {
    const prompt = buildWorksheetPrompt({ topic, grade, subject, chapter, language, activityTypes });
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const response = await callDeepSeek(prompt);
    if (!response.ok) return res.status(502).json({ error: 'AI service temporarily unavailable' });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const json = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    const result = { success: true, data: json };
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Worksheet generation error:', error);
    res.status(500).json({ error: 'Failed to generate worksheet: ' + error.message });
  }
});

// POST /api/ai/generate-scramble-exam — Generate scramble exam using DeepSeek
router.post('/generate-scramble-exam', async (req, res) => {
  const { topic, grade, subject, chapter, totalMarks, timeLimit, difficulty, language } = req.body;
  if (!topic || !grade || !subject) return res.status(400).json({ error: 'topic, grade, subject required' });
  try {
    const prompt = buildScrambleExamPrompt({ topic, grade, subject, chapter, totalMarks, timeLimit, difficulty, language });
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    const response = await callDeepSeek(prompt);
    if (!response.ok) return res.status(502).json({ error: 'AI service temporarily unavailable' });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const json = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
    const result = { success: true, data: json };
    setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Scramble exam generation error:', error);
    res.status(500).json({ error: 'Failed to generate scramble exam: ' + error.message });
  }
});

// ─── Mock Response Generator (for testing without API credits) ────────────────
function getMockResponse(prompt) {
  const p = prompt.toLowerCase();
  let sample;
  if (p.includes('lesson plan') || p.includes('lessonplan')) {
    sample = JSON.stringify({
      lessonPlan: {
        title: "Sample Lesson Plan (Mock)",
        grade: "Grade 10", subject: "Science",
        duration: "40 minutes",
        learningObjectives: ["Identify key concepts", "Apply knowledge to problems", "Demonstrate understanding through practice"],
        requiredMaterials: ["Textbook", "Whiteboard", "Handout worksheets"],
        introduction: "Begin by reviewing previous lesson. Ask students what they remember.",
        mainActivities: [
          { step: 1, duration: "15 min", teacherActivity: "Present new concepts using visual aids", studentActivity: "Take notes and ask questions" },
          { step: 2, duration: "15 min", teacherActivity: "Guide students through practice exercises", studentActivity: "Complete exercises individually then discuss in pairs" },
          { step: 3, duration: "5 min", teacherActivity: "Review answers and clarify misconceptions", studentActivity: "Correct their work and ask follow-up questions" }
        ],
        assessmentMethods: "Exit ticket with 3 quick questions to check understanding",
        discussionQuestions: ["What did you find most interesting?", "How can you apply this outside the classroom?"],
        summary: "Today we covered the main concepts. Remember the key points for homework.",
        homework: "Complete worksheet pages 5-7. Due next class.",
        teacherNotes: "Ensure all students participate. Check for understanding frequently."
      }
    });
  } else if (p.includes('lesson note') || p.includes('lessonnote')) {
    sample = JSON.stringify({
      lessonNote: {
        topic: "Sample Lesson Note (Mock)", grade: "Grade 10", subject: "Science",
        objectives: ["Understand fundamental concepts", "Apply knowledge correctly"],
        keyConcepts: [{ term: "Concept 1", definition: "The primary idea of the lesson" }, { term: "Concept 2", definition: "Supporting concept that builds on Concept 1" }],
        mainExplanation: "Detailed explanation of the topic in student-friendly language. Begin with the basics, then move to more complex ideas.",
        examples: [{ problem: "Sample problem 1", solution: "Step-by-step solution here" }, { problem: "Sample problem 2", solution: "Step-by-step solution here" }],
        classroomActivities: [{ activity: "Group Discussion", instructions: "Split into groups of 4. Discuss the key concepts.", duration: "10 min" }],
        importantNotes: ["Common mistake: confusing Concept 1 and Concept 2", "Key point: Always show your work"],
        summary: "In this lesson we learned the main concepts and practiced applying them.",
        reviewQuestions: [{ question: "Define Concept 1", expectedAnswer: "The primary idea of the lesson" }]
      }
    });
  } else if (p.includes('homework')) {
    sample = JSON.stringify({
      homework: {
        topic: "Sample Homework (Mock)", grade: "Grade 10", subject: "Science",
        instructions: "Answer all questions. Show your work where applicable.",
        questions: [
          { id: 1, type: "multiple_choice", question: "What is the correct answer?", options: ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"], correctAnswer: "B", explanation: "Because Option 2 is the most accurate" },
          { id: 2, type: "true_false", question: "This statement is true.", options: ["True", "False"], correctAnswer: "True", explanation: "The statement aligns with the lesson" },
          { id: 3, type: "short_answer", question: "Explain in your own words why Concept 1 is important.", correctAnswer: "Because it forms the foundation", explanation: "Students should demonstrate understanding" }
        ],
        totalQuestions: 3,
        answerKey: "1:B, 2:True, 3:See explanation"
      }
    });
  } else if (p.includes('worksheet')) {
    sample = JSON.stringify({
      worksheet: {
        topic: "Sample Worksheet (Mock)", grade: "Grade 10", subject: "Science",
        studentName: "____________________", date: "____________________",
        instructions: "Complete all sections. Read each instruction carefully.",
        sections: [
          { title: "Section A: Multiple Choice", type: "exercises", instructions: "Choose the best answer", questions: [{ id: 1, question: "Question 1?", answer: "Answer 1" }, { id: 2, question: "Question 2?", answer: "Answer 2" }] },
          { title: "Section B: Matching", type: "matching", instructions: "Draw lines to match", questions: [{ id: 3, question: "Match item A", answer: "Matches with X" }] }
        ],
        bonusChallenge: "⭐ Challenge: Create your own example and explain it."
      }
    });
  } else if (p.includes('scramble') || p.includes('3 versions')) {
    sample = JSON.stringify({
      scrambleExam: {
        title: "Sample Scramble Exam (Mock)", grade: "Grade 10", subject: "Science", totalMarks: 30, timeLimit: 45,
        instructions: "Read all questions carefully. Show your work.",
        versions: {
          A: { label: "Version A", sections: [{ section: "A", type: "multiple_choice", questions: [{ id: 1, question: "Q1 Version A?", marks: 2, options: ["A. Opt1","B. Opt2","C. Opt3","D. Opt4"], correctAnswer: "B", explanation: "Explanation" }] }] },
          B: { label: "Version B", sections: [{ section: "A", type: "multiple_choice", questions: [{ id: 1, question: "Q1 Version B?", marks: 2, options: ["A. Opt3","B. Opt1","C. Opt2","D. Opt4"], correctAnswer: "C", explanation: "Explanation" }] }] },
          C: { label: "Version C", sections: [{ section: "A", type: "multiple_choice", questions: [{ id: 1, question: "Q1 Version C?", marks: 2, options: ["A. Opt4","B. Opt3","C. Opt2","D. Opt1"], correctAnswer: "D", explanation: "Explanation" }] }] }
        },
        answerKey: { A: { "1": "B" }, B: { "1": "C" }, C: { "1": "D" } }
      }
    });
  } else {
    sample = JSON.stringify({
      exam: { title: "Sample Test (Mock)", totalMarks: 20,
        questions: [{ id: 1, type: "multiple_choice", question: "Sample question?", marks: 2, options: ["A. Opt1","B. Opt2","C. Opt3","D. Opt4"], correctAnswer: "B", explanation: "Explanation" }]
      }
    });
  }
  return { ok: true, json: () => Promise.resolve({ choices: [{ message: { content: sample } }] }) };
}

// GET /api/ai/list-classes — List all classes and subjects from DB
router.get('/list-classes', async (req, res) => {
  try {
    const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='classes_schema'");
    const classes = tables.rows.map(r => r.table_name);
    res.json({ success: true, data: { classes, subjects: ['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'ICT', 'Amharic', 'Arabic', 'Oromo', 'Business', 'Economics', 'General Science'] } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
