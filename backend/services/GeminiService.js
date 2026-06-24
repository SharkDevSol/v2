const { GoogleGenerativeAI } = require('@google/generative-ai');
const GeminiPromptBuilder = require('./GeminiPromptBuilder');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    });
    this.promptBuilder = new GeminiPromptBuilder();
  }
  
  async generateExam(examConfig, retryCount = 0) {
    const MAX_RETRIES = 3;
    
    try {
      // Use GeminiPromptBuilder to generate the prompt
      const prompt = this.promptBuilder.buildExamPrompt(examConfig);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse and validate JSON response
      const examData = JSON.parse(text);
      this.validateExamStructure(examData);
      
      return examData;
    } catch (error) {
      // Handle specific API errors
      if (error.message.includes('RATE_LIMIT') || error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please try again in a few moments.');
      } else if (error.message.includes('INVALID_API_KEY') || error.message.includes('API_KEY') || error.message.includes('401')) {
        throw new Error('Invalid Gemini API key. Please check configuration.');
      } else if (error instanceof SyntaxError) {
        // JSON parsing error
        throw new Error(`Exam generation failed: Invalid JSON response from AI - ${error.message}`);
      } else {
        // Check if error is retryable and we haven't exceeded max retries
        if (this.shouldRetry(error) && retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          await this.sleep(delay);
          return this.generateExam(examConfig, retryCount + 1);
        }
        
        // Re-throw if not retryable or max retries exceeded
        throw new Error(`Exam generation failed: ${error.message}`);
      }
    }
  }
  
  shouldRetry(error) {
    // Don't retry rate limits, auth errors, or validation errors
    if (error.message.includes('RATE_LIMIT') || 
        error.message.includes('429') ||
        error.message.includes('INVALID_API_KEY') ||
        error.message.includes('401') ||
        error.message.includes('Invalid exam structure')) {
      return false;
    }
    
    // Retry network errors, timeouts, and other transient errors
    return true;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  validateExamStructure(examData) {
    if (!examData.exam || !examData.exam.questions) {
      throw new Error('Invalid exam structure returned from AI');
    }
    
    // Validate each question has required fields
    examData.exam.questions.forEach((q, index) => {
      if (!q.type || !q.question || !q.marks || !q.correctAnswer) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }
    });
    
    return true;
  }
}

module.exports = GeminiService;
