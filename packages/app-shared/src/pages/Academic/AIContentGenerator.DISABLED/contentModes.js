export const CONTENT_MODES = [
  {
    id: 'lesson_plan',
    title: 'Lesson Plan',
    description: 'Generate a structured lesson plan with objectives, activities, assessment, and time allocation',
    icon: '📋',
    color: '#4CAF50',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'grade', label: 'Grade/Class', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'chapter', label: 'Chapter/Unit', type: 'text' },
      { name: 'learningObjectives', label: 'Learning Objectives (comma-separated)', type: 'textarea' },
      { name: 'teachingMaterials', label: 'Teaching Materials (comma-separated)', type: 'textarea' },
      { name: 'timeAllocation', label: 'Total Time (minutes)', type: 'number', default: 40 }
    ]
  },
  {
    id: 'lesson_note',
    title: 'Lesson Note',
    description: 'Create detailed lesson notes with explanations, examples, key concepts, and review questions',
    icon: '📝',
    color: '#2196F3',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'grade', label: 'Grade/Class', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'chapter', label: 'Chapter/Unit', type: 'text' }
    ]
  },
  {
    id: 'homework',
    title: 'Homework',
    description: 'Generate homework with multiple choice, short answer, true/false, fill-in-blanks, and matching questions',
    icon: '📚',
    color: '#FF9800',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'grade', label: 'Grade/Class', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'chapter', label: 'Chapter/Unit', type: 'text' },
      { name: 'mcqCount', label: 'Multiple Choice Questions', type: 'number', default: 5 },
      { name: 'shortAnswerCount', label: 'Short Answer Questions', type: 'number', default: 3 },
      { name: 'tfCount', label: 'True/False Questions', type: 'number', default: 5 },
      { name: 'fillBlankCount', label: 'Fill-in-the-Blank Questions', type: 'number', default: 5 },
      { name: 'matchingCount', label: 'Matching Questions (pairs)', type: 'number', default: 5 }
    ]
  },
  {
    id: 'worksheet',
    title: 'Worksheet',
    description: 'Create an interactive worksheet with exercises, matching, fill-in-blanks, identification, and short writing tasks',
    icon: '✏️',
    color: '#9C27B0',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'grade', label: 'Grade/Class', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'chapter', label: 'Chapter/Unit', type: 'text' }
    ]
  },
  {
    id: 'exam',
    title: 'Exam',
    description: 'Generate a full exam with multiple sections and question types. Uses the existing AI Test Generator.',
    icon: '📄',
    color: '#F44336',
    fields: [
      { name: 'topic', label: 'Topic/Unit', type: 'text', required: true },
      { name: 'grade', label: 'Grade/Class', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'chapter', label: 'Chapter', type: 'text' },
      { name: 'totalMarks', label: 'Total Marks', type: 'number', default: 50 }
    ]
  },
  {
    id: 'test',
    title: 'Test',
    description: 'Create a quick classroom test with a small number of questions focused on a specific chapter',
    icon: '✅',
    color: '#009688',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'grade', label: 'Grade/Class', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'chapter', label: 'Chapter/Unit', type: 'text' },
      { name: 'totalMarks', label: 'Total Marks', type: 'number', default: 20 },
      { name: 'timeLimit', label: 'Time Limit (minutes)', type: 'number', default: 20 }
    ]
  },
  {
    id: 'scramble_exam',
    title: 'Scramble Exam',
    description: 'Generate 3 shuffled versions (A, B, C) of the same exam with reordered questions and shuffled MCQ options',
    icon: '🔀',
    color: '#607D8B',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'grade', label: 'Grade/Class', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'chapter', label: 'Chapter', type: 'text' },
      { name: 'totalMarks', label: 'Total Marks', type: 'number', default: 50 },
      { name: 'timeLimit', label: 'Time Limit (minutes)', type: 'number', default: 60 }
    ]
  }
];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
export const LANGUAGES = ['English', 'Afaan Oromo', 'Arabic'];
