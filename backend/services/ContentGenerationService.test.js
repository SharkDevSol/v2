const ContentGenerationService = require('./ContentGenerationService');

// Mock pool
const mockPool = {
  query: jest.fn()
};

// Mock GeminiService
jest.mock('./GeminiService', () => {
  return jest.fn().mockImplementation(() => {
    return {
      model: {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn()
          }
        })
      },
      promptBuilder: {
        buildExamPrompt: jest.fn().mockReturnValue('mock exam prompt')
      }
    };
  });
});

const GeminiService = require('./GeminiService');

describe('ContentGenerationService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContentGenerationService(mockPool);
  });

  describe('1. validateContentStructure()', () => {
    test('1.1 Should validate lesson plan structure', () => {
      const valid = {
        lessonPlan: {
          learningObjectives: ['Obj 1'],
          mainActivities: [{ step: 1, teacherActivity: 'Teach', studentActivity: 'Learn' }],
          summary: 'Summary text'
        }
      };
      expect(service.validateContentStructure('lesson_plan', valid)).toBe(true);
    });

    test('1.2 Should reject lesson plan missing objectives', () => {
      const invalid = {
        lessonPlan: {
          mainActivities: [],
          summary: 'Summary'
        }
      };
      expect(() => service.validateContentStructure('lesson_plan', invalid))
        .toThrow('Lesson plan missing required sections');
    });

    test('1.3 Should validate lesson note structure', () => {
      const valid = {
        lessonNote: {
          detailedExplanation: [{ heading: 'Intro', content: 'Content' }],
          keyConcepts: [{ term: 'Term', definition: 'Def' }],
          summary: 'Summary'
        }
      };
      expect(service.validateContentStructure('lesson_note', valid)).toBe(true);
    });

    test('1.4 Should validate homework structure', () => {
      const valid = {
        homework: {
          questions: [{ id: 1, question: 'Q1', type: 'multiple_choice' }]
        }
      };
      expect(service.validateContentStructure('homework', valid)).toBe(true);
    });

    test('1.5 Should reject empty homework', () => {
      const invalid = {
        homework: {
          questions: []
        }
      };
      expect(() => service.validateContentStructure('homework', invalid))
        .toThrow('Homework must contain at least one question');
    });

    test('1.6 Should validate worksheet structure', () => {
      const valid = {
        worksheet: {
          sections: [{ title: 'Section 1', type: 'exercises', questions: [{ id: 1, question: 'Q1' }] }]
        }
      };
      expect(service.validateContentStructure('worksheet', valid)).toBe(true);
    });

    test('1.7 Should validate test structure', () => {
      const valid = {
        test: {
          sections: [{ section: 'A', title: 'MCQ', marks: 10, questions: [] }]
        }
      };
      expect(service.validateContentStructure('test', valid)).toBe(true);
    });

    test('1.8 Should validate scramble exam structure', () => {
      const valid = {
        scrambleExam: {
          versions: {
            A: { label: 'Version A', sections: [] },
            B: { label: 'Version B', sections: [] },
            C: { label: 'Version C', sections: [] }
          }
        }
      };
      expect(service.validateContentStructure('scramble_exam', valid)).toBe(true);
    });

    test('1.9 Should reject scramble exam missing versions', () => {
      const invalid = {
        scrambleExam: {
          versions: {
            A: { sections: [] }
          }
        }
      };
      expect(() => service.validateContentStructure('scramble_exam', invalid))
        .toThrow('Scramble exam must contain 3 versions');
    });

    test('1.10 Should reject missing top-level key', () => {
      expect(() => service.validateContentStructure('lesson_plan', {}))
        .toThrow('missing top-level key "lessonPlan"');
    });

    test('1.11 Should reject unknown mode', () => {
      expect(() => service.validateContentStructure('unknown', {}))
        .toThrow('Cannot validate unknown mode');
    });

    test('1.12 Should reject null data', () => {
      expect(() => service.validateContentStructure('lesson_plan', null))
        .toThrow('Generated content is empty');
    });
  });

  describe('2. save()', () => {
    test('2.1 Should insert content into database', async () => {
      const mockRow = { id: 1, mode: 'lesson_plan', status: 'draft' };
      mockPool.query.mockResolvedValue({ rows: [mockRow] });

      const data = {
        mode: 'lesson_plan',
        teacher_id: 1,
        grade: 'Grade 5',
        subject: 'Math',
        config: { topic: 'Test' },
        output: { lessonPlan: { summary: 'Test' } }
      };

      const result = await service.save(data);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ai_content'),
        expect.arrayContaining(['lesson_plan', 1, null, 'Grade 5'])
      );
      expect(result).toEqual(mockRow);
    });
  });

  describe('3. update()', () => {
    test('3.1 Should update content output', async () => {
      const mockRow = { id: 1, output: { new: 'data' }, version: 2 };
      mockPool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await service.update(1, { output: { new: 'data' } });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ai_content'),
        expect.arrayContaining([1])
      );
      expect(result.version).toBe(2);
    });

    test('3.2 Should update content status', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ id: 1, status: 'approved' }] });

      await service.update(1, { status: 'approved' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ai_content'),
        expect.arrayContaining(['approved', 1])
      );
    });
  });

  describe('4. list()', () => {
    test('4.1 Should list with teacher filter', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ id: 1, mode: 'lesson_plan' }] });

      const result = await service.list({ teacher_id: 1 });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND teacher_id = $1'),
        [1]
      );
      expect(result).toHaveLength(1);
    });

    test('4.2 Should list with multiple filters', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      await service.list({ teacher_id: 1, mode: 'lesson_plan', status: 'draft' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND mode = $2'),
        expect.arrayContaining([1, 'lesson_plan', 'draft'])
      );
    });

    test('4.3 Should list without filters', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      await service.list({});

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        []
      );
    });
  });

  describe('5. getById()', () => {
    test('5.1 Should return content by id', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ id: 1, mode: 'lesson_plan' }] });

      const result = await service.getById(1);

      expect(result.id).toBe(1);
    });

    test('5.2 Should return null if not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await service.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('6. shuffleArray()', () => {
    test('6.1 Should preserve all elements after shuffle', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const original = [...arr];
      service.shuffleArray(arr);
      expect(arr.sort()).toEqual(original.sort());
      expect(arr.length).toBe(original.length);
    });

    test('6.2 Should not mutate array to identical order every time', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const original = [...arr];
      service.shuffleArray(arr);
      const identical = arr.every((val, idx) => val === original[idx]);
      expect(identical).toBe(false);
    });

    test('6.3 Should handle empty array', () => {
      const arr = [];
      service.shuffleArray(arr);
      expect(arr).toEqual([]);
    });

    test('6.4 Should handle single element', () => {
      const arr = [42];
      service.shuffleArray(arr);
      expect(arr).toEqual([42]);
    });
  });

  describe('7. postProcessScramble()', () => {
    test('7.1 Should generate answer keys', () => {
      const data = {
        scrambleExam: {
          versions: {
            A: {
              sections: [{ type: 'multiple_choice', questions: [{ id: 1, question: 'Q1', correctAnswer: 'A' }] }]
            },
            B: { sections: [] },
            C: { sections: [] }
          }
        }
      };
      service.postProcessScramble(data);
      expect(data.scrambleExam.answerKey).toBeDefined();
      expect(data.scrambleExam.answerKey.A[1]).toBe('A');
    });

    test('7.2 Should handle missing versions gracefully', () => {
      const data = { scrambleExam: { versions: null } };
      expect(() => service.postProcessScramble(data)).not.toThrow();
    });
  });

  describe('8. archive()', () => {
    test('6.1 Should soft delete content', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ id: 1, status: 'archived' }] });

      const result = await service.archive(1);

      expect(result.status).toBe('archived');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("status = 'archived'"),
        [1]
      );
    });
  });
});
