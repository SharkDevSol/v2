const ContentPromptBuilder = require('./ContentPromptBuilder');

describe('ContentPromptBuilder', () => {
  let promptBuilder;

  beforeEach(() => {
    promptBuilder = new ContentPromptBuilder();
  });

  describe('1. buildLessonPlanPrompt()', () => {
    test('1.1 Should build prompt with all required sections', () => {
      const config = {
        topic: 'Introduction to Fractions',
        grade: 'Grade 5',
        subject: 'Mathematics',
        chapter: 'Unit 3: Fractions',
        language: 'English',
        timeAllocation: 40
      };

      const prompt = promptBuilder.buildLessonPlanPrompt(config);

      expect(prompt).toContain('**PERSONA**');
      expect(prompt).toContain('expert Ethiopian educator');
      expect(prompt).toContain('Mathematics');
      expect(prompt).toContain('Grade 5');
      expect(prompt).toContain('Introduction to Fractions');
      expect(prompt).toContain('**TASK**');
      expect(prompt).toContain('LESSON PLAN');
      expect(prompt).toContain('learningObjectives');
      expect(prompt).toContain('mainActivities');
      expect(prompt).toContain('assessmentMethod');
      expect(prompt).toContain('summary');
      expect(prompt).toContain('homework');
      expect(prompt).toContain('timeAllocation');
      expect(prompt).toContain('teacherActivity');
      expect(prompt).toContain('studentActivity');
      expect(prompt).toContain('**CONTEXT**');
      expect(prompt).toContain('Ethiopian National Curriculum');
      expect(prompt).toContain('culturally appropriate');
    });

    test('1.2 Should build prompt for different grade and subject', () => {
      const config = {
        topic: 'The Water Cycle',
        grade: 'Grade 7',
        subject: 'General Science',
        language: 'English'
      };

      const prompt = promptBuilder.buildLessonPlanPrompt(config);

      expect(prompt).toContain('General Science');
      expect(prompt).toContain('Grade 7');
      expect(prompt).toContain('The Water Cycle');
    });

    test('1.3 Should include correct time allocation guidance', () => {
      const config = {
        topic: 'Test Topic',
        grade: 'Grade 6',
        subject: 'English',
        timeAllocation: 30
      };

      const prompt = promptBuilder.buildLessonPlanPrompt(config);

      expect(prompt).toContain('30 minutes');
    });
  });

  describe('2. buildLessonNotePrompt()', () => {
    test('2.1 Should build prompt with all required sections', () => {
      const config = {
        topic: 'Photosynthesis',
        grade: 'Grade 8',
        subject: 'Biology',
        chapter: 'Unit 4: Plant Biology',
        language: 'English'
      };

      const prompt = promptBuilder.buildLessonNotePrompt(config);

      expect(prompt).toContain('LESSON NOTE');
      expect(prompt).toContain('Photosynthesis');
      expect(prompt).toContain('Grade 8');
      expect(prompt).toContain('Biology');
      expect(prompt).toContain('Unit 4: Plant Biology');
      expect(prompt).toContain('detailedExplanation');
      expect(prompt).toContain('keyConcepts');
      expect(prompt).toContain('examples');
      expect(prompt).toContain('classroomActivities');
      expect(prompt).toContain('summary');
      expect(prompt).toContain('reviewQuestions');
      expect(prompt).toContain('Ethiopian National Curriculum');
    });

    test('2.2 Should support different languages', () => {
      const config = {
        topic: 'አዲስ ርዕስ',
        grade: 'Grade 6',
        subject: 'አማርኛ',
        language: 'Amharic'
      };

      const prompt = promptBuilder.buildLessonNotePrompt(config);

      expect(prompt).toContain('Amharic');
    });
  });

  describe('3. buildHomeworkPrompt()', () => {
    test('3.1 Should build prompt with all question types', () => {
      const config = {
        topic: 'Addition and Subtraction',
        grade: 'Grade 3',
        subject: 'Mathematics',
        difficulty: 'Easy',
        language: 'English',
        questionTypes: ['multiple_choice', 'short_answer', 'true_false', 'fill_blank', 'matching'],
        mcqCount: 5,
        shortAnswerCount: 3,
        tfCount: 5,
        fillBlankCount: 5,
        matchingCount: 5
      };

      const prompt = promptBuilder.buildHomeworkPrompt(config);

      expect(prompt).toContain('HOMEWORK');
      expect(prompt).toContain('Addition and Subtraction');
      expect(prompt).toContain('Grade 3');
      expect(prompt).toContain('5 Multiple Choice');
      expect(prompt).toContain('3 Short Answer');
      expect(prompt).toContain('5 True/False');
      expect(prompt).toContain('5 Fill-in-the-Blank');
      expect(prompt).toContain('5 Matching');
      expect(prompt).toContain('Difficulty Level: Easy');
      expect(prompt).toContain('Focus on basic recall');
    });

    test('3.2 Should support minimal question types', () => {
      const config = {
        topic: 'Vocabulary',
        grade: 'Grade 4',
        subject: 'English',
        questionTypes: ['multiple_choice'],
        mcqCount: 10
      };

      const prompt = promptBuilder.buildHomeworkPrompt(config);

      expect(prompt).toContain('10 Multiple Choice');
      expect(prompt).not.toContain('Short Answer');
      expect(prompt).not.toContain('True/False');
    });
  });

  describe('4. buildWorksheetPrompt()', () => {
    test('4.1 Should build prompt with all activity types', () => {
      const config = {
        topic: 'Animal Classification',
        grade: 'Grade 4',
        subject: 'Science',
        language: 'English',
        activityTypes: ['exercises', 'matching', 'fill_blanks', 'identification', 'short_writing']
      };

      const prompt = promptBuilder.buildWorksheetPrompt(config);

      expect(prompt).toContain('WORKSHEET');
      expect(prompt).toContain('Animal Classification');
      expect(prompt).toContain('Grade 4');
      expect(prompt).toContain('Science');
      expect(prompt).toContain('Practice Exercises');
      expect(prompt).toContain('Matching Activity');
      expect(prompt).toContain('Fill in the Blanks');
      expect(prompt).toContain('Identification');
      expect(prompt).toContain('Short Writing Task');
      expect(prompt).toContain('bonusChallenge');
    });
  });

  describe('5. buildTestPrompt()', () => {
    test('5.1 Should build prompt with test specifications', () => {
      const config = {
        topic: 'The Solar System',
        grade: 'Grade 6',
        subject: 'Science',
        difficulty: 'Medium',
        totalMarks: 20,
        timeLimit: 20,
        language: 'English'
      };

      const prompt = promptBuilder.buildTestPrompt(config);

      expect(prompt).toContain('SHORT TEST');
      expect(prompt).toContain('The Solar System');
      expect(prompt).toContain('Grade 6');
      expect(prompt).toContain('Total Marks: 20');
      expect(prompt).toContain('Time Limit: 20 minutes');
      expect(prompt).toContain('Difficulty: Medium');
      expect(prompt).toContain('sections');
      expect(prompt).toContain('multiple_choice|true_false|fill_blank|short_answer');
    });

    test('5.2 Should match total marks in validation requirement', () => {
      const config = {
        topic: 'Test',
        grade: 'Grade 10',
        subject: 'Physics',
        totalMarks: 30
      };

      const prompt = promptBuilder.buildTestPrompt(config);

      expect(prompt).toContain('sum to 30');
    });
  });

  describe('6. buildScrambleExamPrompt()', () => {
    test('6.1 Should build prompt with version specifications', () => {
      const config = {
        topic: 'World War II',
        grade: 'Grade 11',
        subject: 'History',
        difficulty: 'Hard',
        totalMarks: 50,
        timeLimit: 60,
        language: 'English',
        questionDistribution: [
          { type: 'multiple_choice', count: 10, marksEach: 2 },
          { type: 'true_false', count: 5, marksEach: 2 },
          { type: 'short_answer', count: 4, marksEach: 5 }
        ]
      };

      const prompt = promptBuilder.buildScrambleExamPrompt(config);

      expect(prompt).toContain('EXAMINATION');
      expect(prompt).toContain('World War II');
      expect(prompt).toContain('Grade 11');
      expect(prompt).toContain('History');
      expect(prompt).toContain('Total Marks: 50');
      expect(prompt).toContain('Time Limit: 60 minutes');
      expect(prompt).toContain('Difficulty: Hard');
      expect(prompt).toContain('10 multiple_choice');
      expect(prompt).toContain('5 true_false');
      expect(prompt).toContain('4 short_answer');
      expect(prompt).toContain('3 shuffled versions');
      expect(prompt).toContain('Version B');
      expect(prompt).toContain('Version C');
      expect(prompt).toContain('answerKey');
    });
  });

  describe('7. Language Support', () => {
    test('7.1 Should support English', () => {
      const prompt = promptBuilder.buildLessonPlanPrompt({
        topic: 'Topic', grade: 'Grade 5', subject: 'Math', language: 'English'
      });
      expect(prompt).toContain('standard English');
    });

    test('7.2 Should support Afaan Oromo', () => {
      const prompt = promptBuilder.buildHomeworkPrompt({
        topic: 'Topic', grade: 'Grade 5', subject: 'Math', language: 'Afaan Oromo', questionTypes: ['multiple_choice'], mcqCount: 5
      });
      expect(prompt).toContain('Afaan Oromo');
    });

    test('7.3 Should support Arabic', () => {
      const prompt = promptBuilder.buildLessonNotePrompt({
        topic: 'Topic', grade: 'Grade 5', subject: 'Math', language: 'Arabic'
      });
      expect(prompt).toContain('Modern Standard Arabic');
    });
  });
});
