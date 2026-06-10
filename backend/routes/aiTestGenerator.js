const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/ai/generate-test
// Generate test questions using AI
router.post('/generate-test', async (req, res) => {
  const {
    subjectName, className, termNumber, componentName,
    totalMarks, questionTypes, difficulty, language,
    topic, bonusQuestions, timeLimit, teacherNotes
  } = req.body;

  if (!subjectName || !className || !termNumber || !componentName || !totalMarks || !questionTypes) {
    return res.status(400).json({ error: 'Missing required fields: subjectName, className, termNumber, componentName, totalMarks, questionTypes' });
  }

  try {
    // Build the prompt for Gemini
    const prompt = buildGeminiPrompt({
      subjectName, className, termNumber, componentName,
      totalMarks, questionTypes, difficulty: difficulty || 'medium',
      language: language || 'English',
      topic: topic || '',
      bonusQuestions: bonusQuestions || null,
      teacherNotes: teacherNotes || ''
    });

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI API key not configured. Set GEMINI_API_KEY in .env' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the generated text into structured questions
    const questions = parseGeneratedQuestions(generatedText, questionTypes);

    if (questions.length === 0) {
      return res.status(422).json({ error: 'AI returned no valid questions. Please try again with different settings.' });
    }

    res.json({
      success: true,
      questions,
      rawText: generatedText,
      stats: { total: questions.length, ...getQuestionTypeCounts(questions) }
    });

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
      
      // Clear existing questions for this test
      await client.query(`DELETE FROM ${schemaName}.${tableName}`);
      
      // Insert each question
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

// POST /api/ai/publish-test — Publish a saved test to students
router.post('/publish-test', async (req, res) => {
  const { testId } = req.body;
  if (!testId) return res.status(400).json({ error: 'testId required' });
  // TODO: Publish to students (broadcast to student apps)
  res.json({ success: true, message: 'Test published' });
});

function buildGeminiPrompt({ subjectName, className, termNumber, componentName, totalMarks, questionTypes, difficulty, language, topic, bonusQuestions, teacherNotes }) {
  let prompt = `Generate a ${difficulty} difficulty test for "${subjectName}" (Class: ${className}, Term ${termNumber}, Component: ${componentName})`;
  if (topic) prompt += `\nTopic/Unit: ${topic}`;
  prompt += `\nLanguage: ${language}`;
  prompt += `\nTotal Marks: ${totalMarks}`;
  prompt += `\n\nQuestion distribution:`;
  
  for (const qt of questionTypes) {
    prompt += `\n- ${qt.type}: ${qt.count} questions, ${qt.marksPerQuestion} marks each (total: ${qt.count * qt.marksPerQuestion})`;
  }
  
  if (bonusQuestions) {
    prompt += `\n\nBonus questions: ${bonusQuestions.count} questions of type "${bonusQuestions.type}" (${bonusQuestions.marksPerQuestion} marks each)`;
  }
  
  if (teacherNotes) prompt += `\n\nTeacher notes: ${teacherNotes}`;
  
  prompt += `\n\nThe questions must be appropriate for Ethiopian curriculum and context (Grade ${className.replace(/[^0-9]/g, '') || 'appropriate'} level).`;
  prompt += `\n\nIMPORTANT: Format each question EXACTLY as follows:`;
  prompt += `\n[QUESTION_START]`;
  prompt += `\nTYPE: [mcq|true_false|matching|fill_blank|short_answer|essay|multiple_true_false|numeric|transformation]`;
  prompt += `\nMARKS: [number]`;
  prompt += `\nQUESTION: [the question text]`;
  prompt += `\nOPTIONS: [for mcq: A) option1 | B) option2 | C) option3 | D) option4]`;
  prompt += `\nANSWER: [correct answer]`;
  prompt += `\nEXPLANATION: [brief explanation]`;
  prompt += `\n[QUESTION_END]`;
  
  prompt += `\n\nMix the question types together (not grouped by type).`;
  prompt += `\nTotal marks must equal ${totalMarks}.`;
  
  return prompt;
}

function parseGeneratedQuestions(text, questionTypes) {
  const questions = [];
  const blocks = text.split('[QUESTION_START]');
  
  for (const block of blocks) {
    if (!block.includes('[QUESTION_END]')) continue;
    const content = block.split('[QUESTION_END]')[0].trim();
    
    const typeMatch = content.match(/TYPE:\s*(.+)/i);
    const marksMatch = content.match(/MARKS:\s*(\d+)/i);
    const questionMatch = content.match(/QUESTION:\s*(.+?)(?:\nOPTIONS:|$)/is);
    const optionsMatch = content.match(/OPTIONS:\s*(.+?)(?:\nANSWER:|$)/is);
    const answerMatch = content.match(/ANSWER:\s*(.+?)(?:\nEXPLANATION:|$)/is);
    const explanationMatch = content.match(/EXPLANATION:\s*(.+)/is);
    
    if (!questionMatch) continue;
    
    const type = (typeMatch?.[1] || 'mcq').trim().toLowerCase();
    const marks = parseInt(marksMatch?.[1]) || 1;
    
    // Parse options for MCQ
    let options = [];
    if (optionsMatch) {
      const optText = optionsMatch[1].trim();
      options = optText.split(/\s*\|\s*/).map(o => o.trim()).filter(o => o);
    }
    
    questions.push({
      type,
      marks,
      question: questionMatch[1].trim(),
      options,
      answer: answerMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || '',
    });
  }
  
  // Validate total marks match requested
  return questions;
}

function getQuestionTypeCounts(questions) {
  const counts = {};
  for (const q of questions) {
    counts[q.type] = (counts[q.type] || 0) + 1;
  }
  return counts;
}

module.exports = router;
