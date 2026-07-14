// Prompt Builder — generates prompts for all AI features

const DAY_NAMES = {0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'};

function buildSchoolContext(opts = {}) {
  const { schoolConfig, term } = opts;
  const termCount = schoolConfig?.terms || 4;
  const schoolDays = schoolConfig?.school_days || [1,2,3,4,5];
  const dayLabels = schoolDays.map(d => DAY_NAMES[d]).filter(Boolean).join(', ');
  return `School days: ${dayLabels}\nTerm: ${term || 1} of ${termCount}\nTeaching weeks this term: 12 weeks`;
}

function buildBasePrompt({ feature, grade, subject, topic, language, chapter }) {
  return `You are Skoolific AI, an expert Ethiopian educator creating ${feature} materials.

CONTEXT:
- Subject: ${subject}
- Grade: ${grade}
- Topic: ${topic}${chapter ? `\n- Chapter: ${chapter}` : ''}
- Language: ${language || 'English'}
- Curriculum: Ethiopian National Curriculum

CRITICAL RULES:
1. Use ONLY the reference materials provided below
2. Do NOT use any outside knowledge or internet information
3. Use Ethiopian context (names, places, Birr, curriculum examples) where appropriate
4. Content must be age-appropriate for Grade ${grade} Ethiopian students
5. If a fact is not found in the reference materials, state: "This information was not found in the uploaded books"
6. Return ONLY valid JSON — no markdown, no extra text
7. Every fact must cite its source (book name, chapter, page number)

OUTPUT FORMAT:`;
}

function buildLessonPlanPrompt({ grade, subject, topic, chapter, duration, language, term, schoolConfig }) {
  return buildBasePrompt({ feature: 'lesson plan', grade, subject, topic, language, chapter }) + `
{
  "lessonPlan": {
    "title": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",${chapter ? `\n    "chapter": "${chapter}",` : ''}
    "duration": "${duration || 40} minutes",
    "learningObjectives": [],
    "learningOutcomes": [],
    "teachingMaterials": [],
    "starterActivity": { "duration": "5 min", "description": "" },
    "introduction": "",
    "teachingProcedure": [{"step": 1, "duration": "", "teacherActivity": "", "studentActivity": ""}],
    "examples": [],
    "studentActivities": [],
    "assessmentMethods": "",
    "homework": "",
    "reflection": "",
    "timeAllocation": {},
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildLessonNotePrompt({ grade, subject, topic, chapter, language }) {
  return buildBasePrompt({ feature: 'lesson notes', grade, subject, topic, language, chapter }) + `
{
  "lessonNote": {
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",${chapter ? `\n    "chapter": "${chapter}",` : ''}
    "definition": "",
    "explanation": "",
    "examples": [{"title": "", "content": ""}],
    "illustrations": [],
    "importantNotes": [],
    "keywords": [{"term": "", "definition": ""}],
    "summary": "",
    "exercises": [],
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildHomeworkPrompt({ grade, subject, topic, chapter, difficulty, language, questionCount }) {
  return buildBasePrompt({ feature: 'homework', grade, subject, topic, language, chapter }) + `
DIFFICULTY: ${difficulty || 'Medium'}
QUESTION COUNT: ${questionCount || 5}
{
  "homework": {
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",
    "difficulty": "${difficulty || 'Medium'}",
    "instructions": "",
    "questions": [
      {"id": 1, "type": "multiple_choice", "question": "", "options": [], "correctAnswer": "", "explanation": ""},
      {"id": 2, "type": "short_answer", "question": "", "correctAnswer": "", "explanation": ""},
      {"id": 3, "type": "true_false", "question": "", "correctAnswer": "", "explanation": ""},
      {"id": 4, "type": "matching", "question": "", "leftItems": [], "rightItems": [], "correctMatches": []},
      {"id": 5, "type": "essay", "question": "", "rubric": ""}
    ],
    "totalQuestions": ${questionCount || 5},
    "answerKey": "",
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildWorksheetPrompt({ grade, subject, topic, chapter, language, activityTypes }) {
  return buildBasePrompt({ feature: 'worksheet', grade, subject, topic, language, chapter }) + `
{
  "worksheet": {
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",
    "instructions": "",
    "sections": [
      {"title": "", "type": "fill_blank", "instructions": "", "questions": [{"id": 1, "question": "", "answer": ""}]},
      {"title": "", "type": "matching", "instructions": "", "questions": []},
      {"title": "", "type": "problem_solving", "instructions": "", "questions": []}
    ],
    "bonusChallenge": "",
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildQuizPrompt({ grade, subject, topic, chapter, totalMarks, timeLimit, language }) {
  return buildBasePrompt({ feature: 'quiz', grade, subject, topic, language, chapter }) + `
TOTAL MARKS: ${totalMarks || 20}
TIME LIMIT: ${timeLimit || 15} minutes

Generate a mix of: MCQ, True/False, Short Answer, Matching
{
  "quiz": {
    "title": "${topic} Quiz",
    "grade": "${grade}",
    "subject": "${subject}",
    "totalMarks": ${totalMarks || 20},
    "timeLimit": ${timeLimit || 15},
    "questions": [
      {"id": 1, "type": "multiple_choice", "question": "", "marks": 2, "options": [], "correctAnswer": "", "explanation": ""},
      {"id": 2, "type": "true_false", "question": "", "marks": 1, "correctAnswer": "", "explanation": ""},
      {"id": 3, "type": "short_answer", "question": "", "marks": 3, "correctAnswer": "", "explanation": ""},
      {"id": 4, "type": "matching", "question": "", "marks": 4, "leftItems": [], "rightItems": [], "correctMatches": []}
    ],
    "answerKey": {},
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildExamPrompt({ grade, subject, topic, chapter, examType, totalMarks, timeLimit, difficulty, language }) {
  return buildBasePrompt({ feature: 'exam', grade, subject, topic, language, chapter }) + `
EXAM TYPE: ${examType || 'Monthly'}
TOTAL MARKS: ${totalMarks || 50}
TIME LIMIT: ${timeLimit || 60} minutes
DIFFICULTY DISTRIBUTION: Easy 30%, Medium 50%, Hard 20%
BLOOM TAXONOMY: Remember 20%, Understand 30%, Apply 30%, Analyze 10%, Evaluate 10%
{
  "exam": {
    "title": "${topic} ${examType || 'Monthly'} Exam",
    "grade": "${grade}",
    "subject": "${subject}",
    "examType": "${examType || 'Monthly'}",
    "totalMarks": ${totalMarks || 50},
    "timeLimit": ${timeLimit || 60},
    "difficultyDistribution": {"easy": 30, "medium": 50, "hard": 20},
    "bloomDistribution": {"remember": 20, "understand": 30, "apply": 30, "analyze": 10, "evaluate": 10},
    "sections": [
      {"section": "A", "type": "multiple_choice", "marks": 20, "instructions": "Choose the best answer"},
      {"section": "B", "type": "short_answer", "marks": 15, "instructions": "Answer briefly"},
      {"section": "C", "type": "essay", "marks": 15, "instructions": "Answer in detail"}
    ],
    "questions": [],
    "answerKey": {},
    "markingScheme": {},
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildScrambleExamPrompt({ grade, subject, topic, chapter, totalMarks, timeLimit, difficulty, language }) {
  return buildBasePrompt({ feature: 'scrambled exam', grade, subject, topic, language, chapter }) + `
TOTAL MARKS: ${totalMarks || 50}
TIME LIMIT: ${timeLimit || 60} minutes
VERSIONS: 4 (A, B, C, D) — same questions, shuffled order and options
{
  "scrambleExam": {
    "title": "${topic} Exam (4 Versions)",
    "grade": "${grade}",
    "subject": "${subject}",
    "totalMarks": ${totalMarks || 50},
    "timeLimit": ${timeLimit || 60},
    "versionCount": 4,
    "versions": {
      "A": {"label": "Version A", "sections": []},
      "B": {"label": "Version B", "sections": []},
      "C": {"label": "Version C", "sections": []},
      "D": {"label": "Version D", "sections": []}
    },
    "answerKeys": {},
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildChatPrompt(query, context) {
  return `${context}

USER QUESTION: ${query}

Answer based ONLY on the reference materials above. If you cannot find the answer, say:
"I could not find this information in the uploaded books."

Always cite specific book names, chapters, and page numbers.

Return your answer as JSON:
{
  "answer": "",
  "sources": [{"book": "", "chapter": "", "page": ""}],
  "confidence": 0.0
}`;
}

function buildRubricPrompt({ grade, subject, topic, chapter, language }) {
  return buildBasePrompt({ feature: 'assessment rubric', grade, subject, topic, language, chapter }) + `
{
  "rubric": {
    "title": "${topic} Assessment Rubric",
    "grade": "${grade}",
    "subject": "${subject}",
    "criteria": [
      {"name": "", "description": "", "excellent": "", "good": "", "satisfactory": "", "needsImprovement": "", "weight": 25}
    ],
    "totalPoints": 100,
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildActivitiesPrompt({ grade, subject, topic, chapter, duration, language }) {
  return buildBasePrompt({ feature: 'classroom activities', grade, subject, topic, language, chapter }) + `
DURATION: ${duration || 40} minutes
{
  "activities": {
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",
    "activities": [
      {"step": 1, "duration": "", "activityName": "", "description": "", "materials": [], "groupSize": "", "instructions": ""}
    ],
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildProjectPrompt({ grade, subject, topic, chapter, language }) {
  return buildBasePrompt({ feature: 'project work', grade, subject, topic, language, chapter }) + `
{
  "project": {
    "title": "${topic} Project",
    "grade": "${grade}",
    "subject": "${subject}",
    "objectives": [],
    "description": "",
    "deliverables": [],
    "timeline": {"week1": "", "week2": ""},
    "rubric": [],
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildParentReportPrompt({ grade, subject, topic, chapter, language }) {
  return buildBasePrompt({ feature: 'parent report', grade, subject, topic, language, chapter }) + `
{
  "parentReport": {
    "subject": "${subject}",
    "grade": "${grade}",
    "topic": "${topic}",
    "whatStudentLearned": "",
    "keyConcepts": [],
    "areasForImprovement": [],
    "homeworkTips": "",
    "howParentsCanHelp": "",
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

function buildAssessmentPrompt({ grade, subject, topic, chapter, language }) {
  return buildBasePrompt({ feature: 'assessment plan', grade, subject, topic, language, chapter }) + `
{
  "assessment": {
    "title": "${topic} Assessment Plan",
    "grade": "${grade}",
    "subject": "${subject}",
    "formativeAssessments": [],
    "summativeAssessments": [],
    "assessmentCriteria": [],
    "gradingRubric": [],
    "sources": [{"book": "", "chapter": "", "page": ""}],
    "confidence": 0.95
  }
}
`;
}

module.exports = {
  buildLessonPlanPrompt,
  buildLessonNotePrompt,
  buildHomeworkPrompt,
  buildWorksheetPrompt,
  buildQuizPrompt,
  buildExamPrompt,
  buildScrambleExamPrompt,
  buildChatPrompt,
  buildRubricPrompt,
  buildActivitiesPrompt,
  buildProjectPrompt,
  buildParentReportPrompt,
  buildAssessmentPrompt
};
