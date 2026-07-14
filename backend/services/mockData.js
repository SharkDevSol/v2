// Mock Data Generator — returns realistic Ethiopian sample data when MOCK_AI=true

function getMockResponse(prompt) {
  const p = prompt.toLowerCase();
  let sample;

  if (p.includes('lesson plan')) {
    sample = JSON.stringify({
      lessonPlan: {
        title: 'Sample Lesson Plan (Mock)',
        grade: 'Grade 10', subject: 'Mathematics',
        duration: '40 minutes',
        learningObjectives: ['Define linear equations', 'Solve one-variable linear equations', 'Apply linear equations to real-world problems'],
        learningOutcomes: ['By the end of the lesson, students will be able to solve linear equations with 90% accuracy'],
        teachingMaterials: ['Textbook (Grade 10 Mathematics)', 'Whiteboard', 'Markers', 'Worksheet'],
        starterActivity: { duration: '5 min', description: 'Review previous lesson. Ask students: "What is an equation?"' },
        introduction: 'Today we will learn about linear equations, which are fundamental to algebraic thinking.',
        teachingProcedure: [
          { step: 1, duration: '10 min', teacherActivity: 'Explain the concept of linear equations using examples', studentActivity: 'Listen, take notes, and ask questions' },
          { step: 2, duration: '15 min', teacherActivity: 'Guide students through practice problems', studentActivity: 'Solve problems individually and in pairs' },
          { step: 3, duration: '5 min', teacherActivity: 'Review answers and clarify misconceptions', studentActivity: 'Check their work and correct mistakes' }
        ],
        examples: [
          { problem: 'Solve: 2x + 3 = 7', solution: '2x = 4, x = 2' },
          { problem: 'Solve: 3x - 5 = 10', solution: '3x = 15, x = 5' }
        ],
        studentActivities: ['Complete 5 practice problems from the textbook', 'Pair work: create your own linear equation'],
        assessmentMethods: 'Exit ticket with 3 questions. Observe pair work.',
        homework: 'Complete worksheet pages 12-14. Due next class.',
        reflection: 'Students grasped the basic concept but need more practice with word problems.',
        timeAllocation: { starter: '5min', introduction: '5min', main: '25min', assessment: '5min' },
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 45, similarity: 0.92 }],
        confidence: 0.95
      }
    });
  } else if (p.includes('lesson note')) {
    sample = JSON.stringify({
      lessonNote: {
        topic: 'Linear Equations', grade: 'Grade 10', subject: 'Mathematics',
        definition: 'A linear equation is an equation between two variables that gives a straight line when plotted on a graph.',
        explanation: 'Linear equations are the foundation of algebra. They represent relationships where the variable has an exponent of 1.',
        examples: [
          { title: 'Example 1: Simple Equation', content: 'Solve 2x + 5 = 13. Subtract 5 from both sides: 2x = 8. Divide by 2: x = 4.' },
          { title: 'Example 2: Word Problem', content: 'A student buys 3 notebooks for Birr 15 each. If they pay with Birr 100, how much change? Let x = change. 100 - 3(15) = x, x = 55 Birr.' }
        ],
        illustrations: ['Number line representation', 'Balance scale model'],
        importantNotes: ['Always perform the same operation on both sides', 'Check your answer by substituting back'],
        keywords: [
          { term: 'Variable', definition: 'A symbol (usually x) that represents an unknown value' },
          { term: 'Coefficient', definition: 'A number multiplied by a variable' }
        ],
        summary: 'Linear equations are solved by isolating the variable through inverse operations.',
        exercises: [{ question: 'Solve: 4x - 7 = 9', answer: 'x = 4' }],
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 45, similarity: 0.90 }],
        confidence: 0.93
      }
    });
  } else if (p.includes('homework')) {
    sample = JSON.stringify({
      homework: {
        topic: 'Linear Equations', grade: 'Grade 10', subject: 'Mathematics',
        difficulty: 'Medium',
        instructions: 'Answer all questions. Show your work for full credit.',
        questions: [
          { id: 1, type: 'multiple_choice', question: 'Which of the following is a linear equation?', options: ['A. 2x + 3 = 7', 'B. x² = 4', 'C. 1/x = 2', 'D. √x = 3'], correctAnswer: 'A', explanation: 'A linear equation has variable with exponent 1' },
          { id: 2, type: 'short_answer', question: 'Solve: 3x - 7 = 14', correctAnswer: 'x = 7', explanation: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7.' },
          { id: 3, type: 'true_false', question: 'The equation 2x = 10 is solved when x = 5', correctAnswer: 'True', explanation: '2 × 5 = 10 ✓' }
        ],
        totalQuestions: 3,
        answerKey: '1. A | 2. x = 7 | 3. True',
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 45, similarity: 0.88 }],
        confidence: 0.90
      }
    });
  } else if (p.includes('worksheet')) {
    sample = JSON.stringify({
      worksheet: {
        topic: 'Linear Equations', grade: 'Grade 10', subject: 'Mathematics',
        instructions: 'Complete all sections. Show your working.',
        sections: [
          { title: 'Section A: Fill in the Blanks', type: 'fill_blank', instructions: 'Complete each equation', questions: [{ id: 1, question: '2x + ___ = 10 (if x = 3)', answer: '4' }] },
          { title: 'Section B: Matching', type: 'matching', instructions: 'Match each equation to its solution', questions: [{ id: 2, question: '3x = 15', answer: 'x = 5' }] }
        ],
        bonusChallenge: 'Create a word problem that uses a linear equation and solve it.',
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 47, similarity: 0.85 }],
        confidence: 0.92
      }
    });
  } else if (p.includes('quiz')) {
    sample = JSON.stringify({
      quiz: {
        title: 'Linear Equations Quiz', grade: 'Grade 10', subject: 'Mathematics',
        totalMarks: 20, timeLimit: 15,
        questions: [
          { id: 1, type: 'multiple_choice', question: 'What is the solution to 2x + 5 = 13?', marks: 2, options: ['A. x=3', 'B. x=4', 'C. x=5', 'D. x=6'], correctAnswer: 'B', explanation: '2x = 8, x = 4' },
          { id: 2, type: 'true_false', question: 'x = 3 is a solution to 4x - 2 = 10', marks: 1, correctAnswer: 'True', explanation: '4(3) - 2 = 12 - 2 = 10 ✓' }
        ],
        answerKey: { '1': 'B', '2': 'True' },
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 48, similarity: 0.87 }],
        confidence: 0.94
      }
    });
  } else if (p.includes('exam type')) {
    sample = JSON.stringify({
      exam: {
        title: 'Linear Equations Monthly Exam', grade: 'Grade 10', subject: 'Mathematics',
        examType: 'Monthly', totalMarks: 50, timeLimit: 60,
        difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
        bloomDistribution: { remember: 20, understand: 30, apply: 30, analyze: 10, evaluate: 10 },
        sections: [
          { section: 'A', type: 'multiple_choice', marks: 20, instructions: 'Choose the best answer' },
          { section: 'B', type: 'short_answer', marks: 15, instructions: 'Answer briefly' },
          { section: 'C', type: 'essay', marks: 15, instructions: 'Answer in detail' }
        ],
        questions: [],
        answerKey: {},
        markingScheme: {},
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 50, similarity: 0.90 }],
        confidence: 0.93
      }
    });
  } else if (p.includes('scrambled exam') || p.includes('4 versions')) {
    sample = JSON.stringify({
      scrambleExam: {
        title: 'Linear Equations Exam (4 Versions)', grade: 'Grade 10', subject: 'Mathematics',
        totalMarks: 30, timeLimit: 45, versionCount: 4,
        versions: {
          A: { label: 'Version A', sections: [{ section: 'A', type: 'multiple_choice', questions: [{ id: 1, question: 'Solve 2x = 8', marks: 2, options: ['A. x=2', 'B. x=4', 'C. x=6', 'D. x=8'], correctAnswer: 'B' }] }] },
          B: { label: 'Version B', sections: [{ section: 'A', type: 'multiple_choice', questions: [{ id: 1, question: 'If 2x = 8, find x', marks: 2, options: ['A. x=8', 'B. x=6', 'C. x=4', 'D. x=2'], correctAnswer: 'C' }] }] },
          C: { label: 'Version C', sections: [{ section: 'A', type: 'multiple_choice', questions: [{ id: 1, question: 'What value of x satisfies 2x = 8?', marks: 2, options: ['A. x=6', 'B. x=8', 'C. x=2', 'D. x=4'], correctAnswer: 'D' }] }] },
          D: { label: 'Version D', sections: [{ section: 'A', type: 'multiple_choice', questions: [{ id: 1, question: 'Find x: 2x - 8 = 0', marks: 2, options: ['A. x=8', 'B. x=2', 'C. x=4', 'D. x=6'], correctAnswer: 'C' }] }] }
        },
        answerKeys: { A: { '1': 'B' }, B: { '1': 'C' }, C: { '1': 'D' }, D: { '1': 'C' } },
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 50, similarity: 0.88 }],
        confidence: 0.91
      }
    });
  } else if (p.includes('classroom activities') || p.includes('activities')) {
    sample = JSON.stringify({
      activities: {
        topic: 'Linear Equations', grade: 'Grade 10', subject: 'Mathematics',
        activities: [
          { step: 1, duration: '10 min', activityName: 'Equation Bingo', description: 'Students solve equations to complete their bingo cards', materials: ['Bingo cards', 'Answer tokens'], groupSize: 'Individual', instructions: 'Solve each equation and mark the answer on your bingo card' },
          { step: 2, duration: '15 min', activityName: 'Think-Pair-Share', description: 'Students solve word problems in pairs then share with class', materials: ['Problem cards'], groupSize: 'Pairs', instructions: 'Read the word problem, solve together, then explain your solution to the class' }
        ],
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 52, similarity: 0.82 }],
        confidence: 0.89
      }
    });
  } else if (p.includes('project')) {
    sample = JSON.stringify({
      project: {
        title: 'Linear Equations in Real Life Project', grade: 'Grade 10', subject: 'Mathematics',
        objectives: ['Identify linear relationships in daily life', 'Create and solve linear equations from real scenarios', 'Present findings clearly'],
        description: 'Students will find 5 real-life situations that involve linear equations, document them, and present their solutions.',
        deliverables: ['Written report with 5 examples', 'Poster presentation', 'Oral explanation'],
        timeline: { week1: 'Research and collect examples', week2: 'Create report and prepare presentation' },
        rubric: [{ criterion: 'Accuracy', weight: 40, description: 'Equations are correctly formulated and solved' }],
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 55, similarity: 0.80 }],
        confidence: 0.88
      }
    });
  } else if (p.includes('assessment rubr')) {
    sample = JSON.stringify({
      rubric: {
        title: 'Linear Equations Assessment Rubric', grade: 'Grade 10', subject: 'Mathematics',
        criteria: [
          { name: 'Concept Understanding', description: 'Understanding of linear equation concepts', excellent: 'Clearly explains all concepts', good: 'Explains most concepts', satisfactory: 'Explains basic concepts', needsImprovement: 'Cannot explain concepts', weight: 25 },
          { name: 'Problem Solving', description: 'Ability to solve linear equations', excellent: 'Solves all problems correctly', good: 'Solves most problems', satisfactory: 'Solves simple problems', needsImprovement: 'Cannot solve problems', weight: 40 },
          { name: 'Application', description: 'Applies equations to real-world contexts', excellent: 'Applies to complex scenarios', good: 'Applies to familiar scenarios', satisfactory: 'Applies with guidance', needsImprovement: 'Cannot apply', weight: 35 }
        ],
        totalPoints: 100,
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 48, similarity: 0.83 }],
        confidence: 0.90
      }
    });
  } else if (p.includes('parent report')) {
    sample = JSON.stringify({
      parentReport: {
        subject: 'Mathematics', grade: 'Grade 10', topic: 'Linear Equations',
        whatStudentLearned: 'Your child learned how to solve linear equations, including one-variable equations and word problems.',
        keyConcepts: ['What is a linear equation', 'Solving for x', 'Checking answers', 'Real-world applications'],
        areasForImprovement: ['Word problems requiring multiple steps', 'Checking work for errors'],
        homeworkTips: 'Encourage your child to practice 2-3 problems daily and show all steps.',
        howParentsCanHelp: 'Ask your child to explain the steps they used. Practice real-life scenarios like shopping calculations.',
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 45, similarity: 0.85 }],
        confidence: 0.87
      }
    });
  } else if (p.includes('assessment plan')) {
    sample = JSON.stringify({
      assessment: {
        title: 'Linear Equations Assessment Plan', grade: 'Grade 10', subject: 'Mathematics',
        formativeAssessments: ['Exit tickets (daily)', 'Quiz (weekly)', 'Homework review'],
        summativeAssessments: ['Monthly exam', 'End-of-term exam', 'Project presentation'],
        assessmentCriteria: ['Accuracy of solutions (40%)', 'Method/process (30%)', 'Explanation (20%)', 'Timeliness (10%)'],
        gradingRubric: [{ component: 'Exam', weight: 60, description: 'Written exam covering all topics' }],
        sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 48, similarity: 0.82 }],
        confidence: 0.86
      }
    });
  } else {
    // Default: chat response
    sample = JSON.stringify({
      answer: 'Based on the uploaded textbooks, linear equations are mathematical statements where the variable has an exponent of 1. They can be solved by isolating the variable through inverse operations.',
      sources: [{ book: 'Grade 10 Mathematics Textbook', chapter: '3', page: 45, similarity: 0.91 }],
      confidence: 0.93
    });
  }
  return { ok: true, json: () => Promise.resolve({ choices: [{ message: { content: sample } }] }) };
}

module.exports = { getMockResponse };
