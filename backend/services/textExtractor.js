// Text Extraction Service — extracts text from PDF, DOCX, TXT files
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class TextExtractor {
  async extract(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.pdf':
        return this.extractPDF(filePath);
      case '.docx':
        return this.extractDOCX(filePath);
      case '.txt':
      case '.text':
        return this.extractText(filePath);
      case '.pptx':
        return this.extractPPTX(filePath);
      default:
        return this.extractText(filePath);
    }
  }

  async extractPDF(filePath) {
    const buffer = fs.readFileSync(filePath);
    const uint8 = new Uint8Array(buffer);
    const { PDFParse } = pdfParse;
    const parser = new PDFParse(uint8);
    const data = await parser.getText();
    return { text: data.text || '', pageCount: data.pages?.length || 0 };
  }

  async extractDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return { text: result.value };
  }

  async extractText(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { text: content };
  }

  async extractPPTX(filePath) {
    // PPTX fallback — try reading as text (may not work for binary PPTX)
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { text: content };
    } catch {
      return { text: '' };
    }
  }
}

module.exports = new TextExtractor();
