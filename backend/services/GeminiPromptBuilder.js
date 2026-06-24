/**
 * GeminiPromptBuilder - Structured prompt engineering using PTCF framework
 * (Persona/Task/Context/Format)
 * 
 * This class is responsible for building prompts for the Gemini AI service
 * with Ethiopian curriculum context and proper formatting.
 */
class GeminiPromptBuilder {
  /**
   * Build an exam prompt using the PTCF framework
   * @param {Object} examConfig - Configuration object for exam generation
   * @param {string} examConfig.grade - Grade level (e.g., "Grade 9")
   * @param {string} examConfig.subject - Subject name (e.g., "Mathematics")
   * @param {string} examConfig.unit - Unit or topic name
   * @param {string} examConfig.language - Language for the exam (e.g., "English", "Amharic")
   * @param {Array} examConfig.questionTypes - Array of question type objects with count and marksEach
   * @param {string} examConfig.difficulty - Difficulty level (e.g., "Easy", "Medium", "Hard")
   * @param {number} examConfig.totalMarks - Total marks for the exam
   * @param {string} examConfig.componentType - Type of exam component (e.g., "Unit Test", "Final Exam")
   * @returns {string} Formatted prompt string for Gemini AI
   */
  buildExamPrompt(examConfig) {
    const {
      grade,
      subject,
      unit,
      language,
      questionTypes,
      difficulty,
      totalMarks,
      componentType
    } = examConfig;
    
    const difficultyGuidance = this._getDifficultyGuidance(difficulty);
    const languageGuidance = this._getLanguageGuidance(language);
    
    return `
**PERSONA**: You are an expert Ethiopian educator specializing in the Ethiopian National Curriculum, with deep knowledge of ${subject} for Grade ${grade}. You have extensive experience creating high-quality assessments that align with Ethiopian Ministry of Education standards and are appropriate for Ethiopian students' cultural context and educational level.

**TASK**: Generate a ${componentType} examination for ${subject}, Grade ${grade}, ${unit} with the following specifications:
- Total Marks: ${totalMarks}
- Difficulty Level: ${difficulty}
- Language: ${language}
- Question Distribution: ${this.formatQuestionTypes(questionTypes)}

**CONTEXT**:
1. This exam is for Ethiopian students following the Ethiopian National Curriculum
2. All content must be factually accurate and aligned with standard Ethiopian textbooks
3. Questions should be culturally appropriate for Ethiopian context
4. Use only information from approved Ethiopian Ministry of Education materials
5. Ensure questions test understanding, not just memorization
6. Difficulty Level Guidance: ${difficultyGuidance}
7. Language Guidance: ${languageGuidance}

**QUALITY CONTROL REQUIREMENTS**:
1. **Clarity and Precision**: Each question must be clear, unambiguous, and have only ONE correct interpretation
2. **Age Appropriateness**: Language complexity and content must match Grade ${grade} cognitive level
3. **Factual Accuracy**: All information must be verifiably correct - no assumptions or generalizations
4. **Cultural Sensitivity**: Use Ethiopian names, places, and contexts. Avoid culturally inappropriate content
5. **Answer Key Accuracy**: Verify that each correct answer is actually correct and defensible
6. **Distractor Quality** (for MCQ): Wrong options should be plausible but clearly incorrect
7. **Explanation Quality**: Provide educational explanations that help students learn from mistakes
8. **Avoid Common Pitfalls**:
   - No trick questions or deliberately confusing wording
   - No questions with multiple correct answers (unless specified as "select all")
   - No culturally biased content that favors certain backgrounds
   - No outdated or disputed information
   - No grammatically incorrect questions or options
   - No questions that test reading ability more than subject knowledge

**FORMAT**: Return your response as a JSON object with the following structure:
{
  "exam": {
    "title": "string",
    "instructions": "string",
    "totalMarks": number,
    "questions": [
      {
        "id": number,
        "type": "multiple_choice" | "true_false" | "matching" | "fill_blank" | "short_answer" | "essay" | "numeric",
        "question": "string",
        "marks": number,
        "options": ["string"] (for MCQ, matching, true_false),
        "correctAnswer": "string" | ["string"],
        "explanation": "string"
      }
    ]
  }
}

**JSON FORMAT REQUIREMENTS**:
1. Return ONLY valid JSON - no markdown code blocks, no explanatory text
2. Ensure all strings are properly escaped (quotes, newlines, special characters)
3. Use double quotes for all JSON keys and string values
4. Ensure all arrays and objects are properly closed
5. Do not include trailing commas
6. Verify the JSON is parseable before returning

**REQUIREMENTS**:
1. **Question Grouping**: Group all questions by type (all True/False together, all MCQ together, etc.)
2. **Sequential Numbering**: Number questions sequentially starting from 1
3. **Marks Validation**: Ensure total marks sum to ${totalMarks}
4. **Question Quality**: Provide clear, unambiguous questions
5. **Explanation Depth**: Include detailed explanations for correct answers
6. For matching questions, ensure equal number of items in both columns
7. For fill-in-the-blank, use _____ to indicate blanks
6. **Options Format**:
   - For multiple_choice: Provide 4 options (A, B, C, D) with exactly one correct answer
   - For true_false: Provide exactly 2 options ["True", "False"]
   - For matching: Ensure equal number of items in both columns (minimum 4 pairs)
   - For fill_blank: Use "_____ " (5 underscores + space) to indicate each blank
   - For numeric: Specify units if applicable in the question
7. **Correct Answer Format**:
   - For multiple_choice/true_false: Single string matching one option exactly
   - For matching: Array of strings in correct order
   - For fill_blank: String or array of strings (one per blank)
   - For numeric: String representation of the number with units if applicable
   - For short_answer/essay: Provide model answer or key points

**ETHIOPIAN CONTEXT REQUIREMENTS**:
1. Use Ethiopian names for people in word problems (e.g., Abebe, Almaz, Kebede, Tigist)
2. Use Ethiopian places and contexts (e.g., Addis Ababa, Bahir Dar, Ethiopian Birr)
3. Reference Ethiopian culture, history, and geography where appropriate
4. Use measurement units commonly used in Ethiopia
5. Ensure all examples are relatable to Ethiopian students' daily experiences

**FINAL VALIDATION CHECKLIST** (verify before returning):
✓ All questions are clear and unambiguous
✓ All correct answers are verifiably correct
✓ All explanations are educational and accurate
✓ Total marks sum to ${totalMarks}
✓ Questions are grouped by type
✓ JSON is valid and parseable
✓ No culturally inappropriate content
✓ Language matches ${language} specification
✓ Difficulty matches ${difficulty} level
✓ Content is age-appropriate for Grade ${grade}

Generate the exam now.
`;
  }
  
  /**
   * Get difficulty-specific guidance for exam generation
   * @param {string} difficulty - Difficulty level (Easy, Medium, or Hard)
   * @returns {string} Guidance text for the specified difficulty level
   * @private
   */
  _getDifficultyGuidance(difficulty) {
    const guidanceMap = {
      'Easy': 'Focus on basic recall and simple concepts. Questions should be straightforward with minimal multi-step reasoning. Students should be able to answer by directly applying what they learned without complex analysis.',
      'Medium': 'Focus on application of concepts with moderate complexity. Include some multi-step reasoning and connections between ideas. Questions should require students to demonstrate understanding beyond simple recall.',
      'Hard': 'Focus on complex analysis and synthesis of multiple concepts. Include advanced reasoning, problem-solving, and critical thinking. Questions should challenge students to apply knowledge in novel situations and make sophisticated connections.'
    };
    
    return guidanceMap[difficulty] || guidanceMap['Medium'];
  }
  
  /**
   * Get language-specific guidance for exam generation
   * @param {string} language - Language for the exam (English, Arabic, Amharic, Oromo, Somali, French)
   * @returns {string} Language-specific instructions for the AI
   * @private
   */
  _getLanguageGuidance(language) {
    const guidanceMap = {
      'English': 'Generate all exam content in standard English using clear and formal academic language. Use proper grammar, spelling, and punctuation appropriate for educational assessments.',
      'Arabic': 'Generate all exam content in Modern Standard Arabic (الفصحى). Use right-to-left text formatting, Arabic numerals (١، ٢، ٣...), and formal academic Arabic terminology. Ensure proper diacritical marks where necessary for clarity.',
      'Amharic': 'Generate all exam content in Amharic script (አማርኛ). Use appropriate Amharic academic terminology and formal language. Use Ge\'ez numerals (፩፣ ፪፣ ፫...) where culturally appropriate, or Arabic numerals as standard practice in Ethiopian education.',
      'Oromo': 'Generate all exam content in Oromo language (Afaan Oromoo) using Latin script. Use appropriate Oromo terminology and formal academic language following standard Oromo orthography.',
      'Somali': 'Generate all exam content in Somali language (Af-Soomaali) using Latin script. Use appropriate Somali terminology and formal academic language following standard Somali orthography.',
      'French': 'Generate all exam content in standard French using formal academic language. Use proper French grammar, spelling, and punctuation appropriate for educational assessments. Follow French academic conventions.'
    };
    
    return guidanceMap[language] || guidanceMap['English'];
  }
  
  /**
   * Format question types into a human-readable string
   * @param {Array} questionTypes - Array of question type objects
   * @param {number} questionTypes[].count - Number of questions of this type
   * @param {string} questionTypes[].type - Type of question (e.g., "multiple_choice")
   * @param {number} questionTypes[].marksEach - Marks per question of this type
   * @returns {string} Formatted string describing question distribution
   */
  formatQuestionTypes(questionTypes) {
    return questionTypes.map(qt => 
      `${qt.count} ${qt.type} questions (${qt.marksEach} marks each)`
    ).join(', ');
  }
}

module.exports = GeminiPromptBuilder;
