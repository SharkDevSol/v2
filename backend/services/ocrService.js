// OCR Service — extracts text from scanned PDFs/images using Tesseract.js
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

class OCRService {
  async extractText(filePath, language = 'eng') {
    try {
      const result = await Tesseract.recognize(filePath, language, {
        logger: (m) => { if (m.status === 'recognizing text') process.stdout.write(`\rOCR: ${Math.round(m.progress * 100)}%`); }
      });
      console.log('\n');
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words.length,
        lines: result.data.lines.length
      };
    } catch (e) {
      console.error('OCR error:', e.message);
      return { text: '', confidence: 0, words: 0, lines: 0 };
    }
  }

  async extractBatch(filePaths, language = 'eng') {
    const results = [];
    for (const fp of filePaths) {
      console.log(`OCR processing: ${path.basename(fp)}`);
      const result = await this.extractText(fp, language);
      results.push({ filePath: fp, ...result });
    }
    return results;
  }

  detectLanguage(filePath) {
    const name = path.basename(filePath).toLowerCase();
    if (name.match(/amhar|አማርኛ/i)) return 'amh';
    if (name.match(/orom|afan/i)) return 'orm';
    if (name.match(/tigr|ትግርኛ/i)) return 'tir';
    return 'eng';
  }
}

module.exports = new OCRService();
