/**
 * Test file for Question Type Schemas
 * 
 * This file contains basic tests to verify the question type schemas
 * and validation functions work correctly.
 */

const {
  validateQuestion,
  validateExam,
  getSupportedQuestionTypes,
  isQuestionTypeSupported,
  getQuestionSchema
} = require('./questionTypes');

describe('Question Type Schemas', () => {
  test('Supported Question Types', () => {
    const supportedTypes = getSupportedQuestionTypes();
    expect(supportedTypes.length).toBe(9);
  });

  test('Valid Multiple Choice Question', () => {
    const validMCQ = {
      id: 1,
      type: 'multiple_choice',
      question: 'What is the capital of Ethiopia?',
      options: ['Addis Ababa', 'Nairobi', 'Kampala', 'Khartoum'],
      correctAnswer: 'Addis Ababa',
      marks: 2,
      explanation: 'Addis Ababa is the capital and largest city of Ethiopia.'
    };
    const validation = validateQuestion(validMCQ);
    expect(validation.valid).toBe(true);
  });

  test('Invalid Multiple Choice Question (missing options)', () => {
    const invalidMCQ = {
      id: 2,
      type: 'multiple_choice',
      question: 'What is 2+2?',
      correctAnswer: '4',
      marks: 1,
      explanation: 'Basic arithmetic'
    };
    const validation = validateQuestion(invalidMCQ);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain("Field 'options' is required for multiple_choice questions");
  });

  test('Valid True/False Question', () => {
    const validTF = {
      id: 3,
      type: 'true_false',
      question: 'Ethiopia uses the Gregorian calendar.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      marks: 1,
      explanation: 'Ethiopia uses the Ethiopian calendar.'
    };
    const validation = validateQuestion(validTF);
    expect(validation.valid).toBe(true);
  });

  test('Valid Matching Question', () => {
    const validMatching = {
      id: 4,
      type: 'matching',
      question: 'Match the Ethiopian emperors with their achievements:',
      leftColumn: ['Haile Selassie', 'Menelik II', 'Tewodros II'],
      rightColumn: ['Modernized Ethiopia', 'Defeated Italy at Adwa', 'United Ethiopia'],
      correctMatches: [
        { left: 'Haile Selassie', right: 'Modernized Ethiopia' },
        { left: 'Menelik II', right: 'Defeated Italy at Adwa' },
        { left: 'Tewodros II', right: 'United Ethiopia' }
      ],
      marks: 3,
      explanation: 'Historical achievements of Ethiopian emperors.'
    };
    const validation = validateQuestion(validMatching);
    expect(validation.valid).toBe(true);
  });

  test('Valid Fill-in-the-Blank Question', () => {
    const validFillBlank = {
      id: 5,
      type: 'fill_blank',
      question: 'The capital of Ethiopia is _____ and it is located at approximately _____ meters elevation.',
      correctAnswers: ['Addis Ababa', '2400'],
      marks: 2,
      explanation: 'Addis Ababa is at about 2,400 meters above sea level.'
    };
    const validation = validateQuestion(validFillBlank);
    expect(validation.valid).toBe(true);
  });

  test('Valid Numeric Question', () => {
    const validNumeric = {
      id: 6,
      type: 'numeric',
      question: 'Calculate the area of a rectangle with length 12 cm and width 8 cm.',
      correctAnswer: '96',
      unit: 'cm²',
      marks: 2,
      explanation: 'Area = length × width = 12 × 8 = 96 cm²'
    };
    const validation = validateQuestion(validNumeric);
    expect(validation.valid).toBe(true);
  });

  test('Valid Short Answer Question', () => {
    const validShortAnswer = {
      id: 7,
      type: 'short_answer',
      question: 'Explain the significance of the Battle of Adwa.',
      modelAnswer: 'The Battle of Adwa was a decisive Ethiopian victory against Italy that preserved Ethiopian independence.',
      keyPoints: [
        'Decisive Ethiopian victory',
        'Defeated Italian colonization',
        'Preserved independence'
      ],
      marks: 5,
      explanation: 'Should mention victory, independence, and African resistance.'
    };
    const validation = validateQuestion(validShortAnswer);
    expect(validation.valid).toBe(true);
  });

  test('Valid Essay Question', () => {
    const validEssay = {
      id: 8,
      type: 'essay',
      question: 'Discuss the impact of the Ethiopian calendar on modern society.',
      modelAnswer: 'The Ethiopian calendar has both cultural significance and practical implications for modern Ethiopian society...',
      rubric: [
        { criterion: 'Understanding of calendar', points: 3 },
        { criterion: 'Analysis of impact', points: 3 },
        { criterion: 'Organization', points: 2 }
      ],
      marks: 8,
      explanation: 'Should demonstrate understanding and provide examples.'
    };
    const validation = validateQuestion(validEssay);
    expect(validation.valid).toBe(true);
  });

  test('Valid Transformation Question', () => {
    const validTransformation = {
      id: 9,
      type: 'transformation',
      question: 'Correct the grammatical errors in the following sentence:',
      originalText: 'The students was going to school.',
      correctTransformation: 'The students were going to school.',
      marks: 2,
      explanation: 'Subject-verb agreement: students (plural) requires were.'
    };
    const validation = validateQuestion(validTransformation);
    expect(validation.valid).toBe(true);
  });

  test('Valid Exam with Multiple Questions', () => {
    const validExam = {
      title: 'Sample Math Test',
      totalMarks: 11,
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'This is a long enough question for validation',
          options: ['A', 'B'],
          correctAnswer: 'A',
          marks: 2,
          explanation: 'This is a long enough explanation for validation'
        },
        {
          id: 2,
          type: 'true_false',
          question: 'This is a long enough question for validation',
          options: ['True', 'False'],
          correctAnswer: 'True',
          marks: 1,
          explanation: 'This is a long enough explanation for validation'
        },
        {
          id: 6,
          type: 'numeric',
          question: 'This is a long enough question for validation',
          correctAnswer: '96',
          marks: 4,
          explanation: 'This is a long enough explanation for validation'
        },
        {
          id: 5,
          type: 'fill_blank',
          question: 'This is a long enough question with _____',
          correctAnswers: ['A'],
          marks: 4,
          explanation: 'This is a long enough explanation for validation'
        }
      ]
    };
    const validation = validateExam(validExam);
    if (!validation.valid) console.log(validation.errors, validation.questionErrors);
    expect(validation.valid).toBe(true);
  });

  test('Invalid Exam (mismatched total marks)', () => {
    const invalidExam = {
      title: 'Invalid Test',
      totalMarks: 100,
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'This is a long enough question for validation',
          options: ['A', 'B'],
          correctAnswer: 'A',
          marks: 2,
          explanation: 'This is a long enough explanation for validation'
        }
      ]
    };
    const validation = validateExam(invalidExam);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Total marks mismatch: declared 100, calculated 2');
  });

  test('Check Question Type Support', () => {
    expect(isQuestionTypeSupported('multiple_choice')).toBe(true);
    expect(isQuestionTypeSupported('invalid_type')).toBe(false);
  });

  test('Get Question Schema', () => {
    const mcqSchema = getQuestionSchema('multiple_choice');
    expect(mcqSchema).not.toBeNull();
    expect(mcqSchema.options).toBeDefined();
  });

  test('Valid Multiple True/False Question', () => {
    const validMultipleTF = {
      id: 10,
      type: 'multiple_true_false',
      question: 'Evaluate the following statements:',
      statements: [
        'Statement 1',
        'Statement 2'
      ],
      correctAnswers: [true, false],
      marks: 2,
      explanation: 'Explanation'
    };
    const validation = validateQuestion(validMultipleTF);
    expect(validation.valid).toBe(true);
  });
});
