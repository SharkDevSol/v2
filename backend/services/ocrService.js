// OCR / Text Extraction Service — reads ANY file: PDF, DOCX, XLS, TXT, images (Tesseract)
const fs = require('fs');
const path = require('path');

class OCRService {
  async extractText(filePath, language = 'eng') {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      console.log(`Extract: ${path.basename(filePath)} (${ext}, ${stat ? Math.round(stat.size / 1024) : '?'} KB, lang=${language})`);

      if (ext === '.pdf') return await this.extractPdf(filePath);
      if (ext === '.docx') return await this.extractDocx(filePath);
      if (ext === '.doc') return await this.extractDocFallback(filePath);
      if (ext === '.xlsx' || ext === '.xls') return await this.extractExcel(filePath);
      if (ext === '.txt' || ext === '.md' || ext === '.csv') return this.extractTxt(filePath);
      // images and anything else -> Tesseract OCR
      return await this.extractImage(filePath, language);
    } catch (e) {
      console.error('Extract error:', e.message);
      return { text: '', confidence: 0, words: 0, lines: 0, error: e.message };
    }
  }

  // Text-based PDFs (any size, any language) via pdf-parse (v1 and v2 APIs)
  async extractPdf(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      let text = '';
      let pages = null;
      let mod = null;
      try { mod = require('pdf-parse'); } catch (e) { mod = null; }

      if (mod && mod.PDFParse) {
        // pdf-parse v2+
        const parser = new mod.PDFParse({ data: new Uint8Array(dataBuffer) });
        try {
          const result = await parser.getText();
          text = ((result && result.text) || '').trim();
          if (result && result.total) pages = result.total;
        } finally {
          try { await parser.destroy(); } catch (e) { /* ignore */ }
        }
      } else if (mod) {
        // pdf-parse v1
        const fn = typeof mod === 'function' ? mod : (mod.default || mod);
        const data = await fn(dataBuffer);
        text = (data.text || '').trim();
        pages = data.numpages || null;
      } else {
        throw new Error('pdf-parse not installed');
      }

      if (text.length > 0) {
        console.log(`PDF text extracted: ${text.length} chars, ${pages || '?'} pages`);
        return { text, confidence: 100, words: text.split(/\s+/).length, lines: text.split('\n').length };
      }
      // Scanned PDF (no text layer) — tell the user clearly
      console.log('PDF has no text layer (scanned images only)');
      return { text: '', confidence: 0, words: 0, lines: 0, scanned: true };
    } catch (e) {
      console.error('PDF extract error:', e.message);
      return { text: '', confidence: 0, words: 0, lines: 0, error: e.message };
    }
  }

  // Modern Word documents
  async extractDocx(filePath) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      const text = (result.value || '').trim();
      console.log(`DOCX text extracted: ${text.length} chars`);
      return { text, confidence: 100, words: text.split(/\s+/).length, lines: text.split('\n').length };
    } catch (e) {
      console.error('DOCX extract error:', e.message);
      return { text: '', confidence: 0, words: 0, lines: 0, error: e.message };
    }
  }

  // Legacy .doc — best effort: strip binary, keep readable runs
  extractDocFallback(filePath) {
    try {
      const buf = fs.readFileSync(filePath);
      const text = buf.toString('latin1').replace(/[^\x20-\x7E\n\r\t\u00C0-\u024F\u0600-\u06FF\u1200-\u137F]+/g, ' ').replace(/\s{3,}/g, '\n').trim();
      console.log(`DOC fallback extracted: ${text.length} chars`);
      return { text, confidence: 60, words: text.split(/\s+/).length, lines: text.split('\n').length };
    } catch (e) {
      return { text: '', confidence: 0, words: 0, lines: 0, error: e.message };
    }
  }

  // Excel — all sheets to text
  async extractExcel(filePath) {
    try {
      const XLSX = require('xlsx');
      const wb = XLSX.readFile(filePath);
      let out = [];
      for (const name of wb.SheetNames) {
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
        if (csv.trim()) out.push(`[Sheet: ${name}]\n${csv.trim()}`);
      }
      const text = out.join('\n\n');
      console.log(`Excel text extracted: ${text.length} chars`);
      return { text, confidence: 100, words: text.split(/\s+/).length, lines: text.split('\n').length };
    } catch (e) {
      console.error('Excel extract error:', e.message);
      return { text: '', confidence: 0, words: 0, lines: 0, error: e.message };
    }
  }

  extractTxt(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf8').trim();
      return { text, confidence: 100, words: text.split(/\s+/).length, lines: text.split('\n').length };
    } catch (e) {
      return { text: '', confidence: 0, words: 0, lines: 0, error: e.message };
    }
  }

  // Scanned images via Tesseract
  async extractImage(filePath, language = 'eng') {
    try {
      const Tesseract = require('tesseract.js');
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
      return { text: '', confidence: 0, words: 0, lines: 0, error: e.message };
    }
  }

  async extractBatch(filePaths, language = 'eng') {
    const results = [];
    for (const fp of filePaths) {
      console.log(`Extract processing: ${path.basename(fp)}`);
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
