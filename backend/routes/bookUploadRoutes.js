const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

const uploadDir = path.join(__dirname, '..', 'uploads', 'books');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.pdf', '.txt', '.doc', '.docx'].includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, TXT, DOC, DOCX allowed'));
} });

// CREATE books table
router.get('/init', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS uploaded_books (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, filename VARCHAR(255) NOT NULL,
      subject VARCHAR(100), grade VARCHAR(50), chapter VARCHAR(100), description TEXT,
      file_path TEXT NOT NULL, file_size BIGINT, mime_type VARCHAR(100),
      content_text TEXT, status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    res.json({ success: true, message: 'Books table initialized' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/books/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { subject, grade, chapter, description } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Read text content for RAG context
    let contentText = '';
    if (file.mimetype === 'text/plain') {
      contentText = fs.readFileSync(file.path, 'utf8').substring(0, 100000);
    }

    const result = await pool.query(
      `INSERT INTO uploaded_books (name, filename, subject, grade, chapter, description, file_path, file_size, mime_type, content_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [file.originalname, file.filename, subject, grade, chapter, description, file.path, file.size, file.mimetype, contentText]
    );
    res.json({ success: true, id: result.rows[0].id, message: 'Book uploaded' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/books — list all uploaded books
router.get('/', async (req, res) => {
  try {
    const { subject, grade } = req.query;
    let query = 'SELECT id, name, subject, grade, chapter, description, file_size, mime_type, status, created_at FROM uploaded_books WHERE status=$1';
    const params = ['active'];
    if (subject) { query += ' AND subject=$' + (params.length + 1); params.push(subject); }
    if (grade) { query += ' AND grade=$' + (params.length + 1); params.push(grade); }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/books/:id/context — get text context for AI
router.get('/:id/context', async (req, res) => {
  try {
    const result = await pool.query('SELECT content_text, name FROM uploaded_books WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ success: true, context: result.rows[0].content_text || '', bookName: result.rows[0].name });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/books/:id — soft delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE uploaded_books SET status=$1 WHERE id=$2', ['archived', req.params.id]);
    res.json({ success: true, message: 'Book archived' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
