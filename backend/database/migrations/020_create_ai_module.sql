-- ============================================================
-- SKOOLIFIC AI MODULE — Complete Database Schema
-- ============================================================

-- Schema for AI module
CREATE SCHEMA IF NOT EXISTS ai_schema;

-- ============================================================
-- TABLES
-- ============================================================

-- 1. Books Registry
CREATE TABLE IF NOT EXISTS ai_schema.books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  grade VARCHAR(50),
  subject VARCHAR(200),
  term VARCHAR(50),
  chapter VARCHAR(200),
  publisher VARCHAR(300),
  language VARCHAR(50) DEFAULT 'English',
  academic_year VARCHAR(20),
  description TEXT,
  tags TEXT[],
  author VARCHAR(300),
  visibility VARCHAR(20) DEFAULT 'branch',
  branch_code VARCHAR(50),
  school_id INTEGER,
  file_count INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'uploading',
  embedding_status VARCHAR(20) DEFAULT 'pending',
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Book Files
CREATE TABLE IF NOT EXISTS ai_schema.book_files (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES ai_schema.books(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_path TEXT NOT NULL,
  file_format VARCHAR(20),
  file_size BIGINT,
  page_count INTEGER DEFAULT 0,
  ocr_status VARCHAR(20) DEFAULT 'pending',
  ocr_confidence REAL,
  language VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Book Chunks with Vector Embedding
CREATE TABLE IF NOT EXISTS ai_schema.book_chunks (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES ai_schema.books(id) ON DELETE CASCADE,
  file_id INTEGER REFERENCES ai_schema.book_files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  page_number INTEGER,
  chapter VARCHAR(200),
  topic VARCHAR(300),
  keywords TEXT[],
  embedding DOUBLE PRECISION[],
  embedding_dim INTEGER DEFAULT 1536,
  token_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Generation History
CREATE TABLE IF NOT EXISTS ai_schema.generations (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL,
  feature VARCHAR(50) NOT NULL,
  grade VARCHAR(50),
  subject VARCHAR(200),
  topic VARCHAR(500),
  prompt_text TEXT,
  retrieved_sources JSONB DEFAULT '[]',
  generated_output JSONB DEFAULT '{}',
  edited_output JSONB DEFAULT '{}',
  confidence REAL DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[],
  branch_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Favorites
CREATE TABLE IF NOT EXISTS ai_schema.favorites (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, generation_id)
);

-- 6. Chat History
CREATE TABLE IF NOT EXISTS ai_schema.chat_history (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  retrieved_sources JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0,
  branch_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Prompt Templates
CREATE TABLE IF NOT EXISTS ai_schema.prompt_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  feature VARCHAR(50) NOT NULL,
  template TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Usage Statistics
CREATE TABLE IF NOT EXISTS ai_schema.usage_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  feature VARCHAR(50) NOT NULL,
  request_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  teacher_id INTEGER,
  branch_code VARCHAR(50),
  UNIQUE(date, feature, teacher_id, branch_code)
);

-- 9. Retrieval Logs (Audit)
CREATE TABLE IF NOT EXISTS ai_schema.retrieval_logs (
  id SERIAL PRIMARY KEY,
  query_text TEXT NOT NULL,
  retrieved_chunk_ids INTEGER[],
  total_chunks_retrieved INTEGER DEFAULT 0,
  avg_similarity REAL DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  teacher_id INTEGER,
  feature VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Embedding Queue
CREATE TABLE IF NOT EXISTS ai_schema.embedding_queue (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES ai_schema.books(id) ON DELETE CASCADE,
  file_id INTEGER REFERENCES ai_schema.book_files(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'queued',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- 11. Feedback
CREATE TABLE IF NOT EXISTS ai_schema.feedback (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Generated Content Output Tables

-- Lesson Plans
CREATE TABLE IF NOT EXISTS ai_schema.lesson_plans (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  title VARCHAR(500),
  grade VARCHAR(50),
  subject VARCHAR(200),
  duration VARCHAR(50),
  learning_objectives JSONB DEFAULT '[]',
  required_materials JSONB DEFAULT '[]',
  introduction TEXT,
  main_activities JSONB DEFAULT '[]',
  assessment_methods TEXT,
  discussion_questions JSONB DEFAULT '[]',
  summary TEXT,
  homework TEXT,
  teacher_notes TEXT,
  time_allocation JSONB DEFAULT '{}',
  source_refs JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0
);

-- Lesson Notes
CREATE TABLE IF NOT EXISTS ai_schema.lesson_notes (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  title VARCHAR(500),
  grade VARCHAR(50),
  subject VARCHAR(200),
  topic VARCHAR(500),
  definition TEXT,
  explanation TEXT,
  examples JSONB DEFAULT '[]',
  illustrations JSONB DEFAULT '[]',
  important_notes JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  summary TEXT,
  exercises JSONB DEFAULT '[]',
  source_refs JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0
);

-- Worksheets
CREATE TABLE IF NOT EXISTS ai_schema.worksheets (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  title VARCHAR(500),
  grade VARCHAR(50),
  subject VARCHAR(200),
  topic VARCHAR(500),
  instructions TEXT,
  sections JSONB DEFAULT '[]',
  bonus_challenge TEXT,
  source_refs JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0
);

-- Homework
CREATE TABLE IF NOT EXISTS ai_schema.homework (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  topic VARCHAR(500),
  grade VARCHAR(50),
  subject VARCHAR(200),
  difficulty VARCHAR(20),
  instructions TEXT,
  questions JSONB DEFAULT '[]',
  total_questions INTEGER DEFAULT 0,
  answer_key TEXT,
  source_refs JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0
);

-- Quizzes
CREATE TABLE IF NOT EXISTS ai_schema.quizzes (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  title VARCHAR(500),
  grade VARCHAR(50),
  subject VARCHAR(200),
  topic VARCHAR(500),
  total_marks INTEGER DEFAULT 0,
  time_limit INTEGER,
  questions JSONB DEFAULT '[]',
  answer_key JSONB DEFAULT '{}',
  explanations JSONB DEFAULT '{}',
  source_refs JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0
);

-- Generated Exams
CREATE TABLE IF NOT EXISTS ai_schema.generated_exams (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  title VARCHAR(500),
  grade VARCHAR(50),
  subject VARCHAR(200),
  exam_type VARCHAR(50),
  total_marks INTEGER DEFAULT 0,
  time_limit INTEGER,
  difficulty_distribution JSONB DEFAULT '{}',
  bloom_distribution JSONB DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  questions JSONB DEFAULT '[]',
  answer_key JSONB DEFAULT '{}',
  marking_scheme JSONB DEFAULT '{}',
  source_refs JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0
);

-- Scrambled Exams
CREATE TABLE IF NOT EXISTS ai_schema.scrambled_exams (
  id SERIAL PRIMARY KEY,
  generation_id INTEGER REFERENCES ai_schema.generations(id) ON DELETE CASCADE,
  title VARCHAR(500),
  grade VARCHAR(50),
  subject VARCHAR(200),
  original_exam_id INTEGER,
  total_marks INTEGER DEFAULT 0,
  time_limit INTEGER,
  version_count INTEGER DEFAULT 4,
  versions JSONB DEFAULT '{}',
  answer_keys JSONB DEFAULT '{}',
  source_refs JSONB DEFAULT '[]',
  confidence REAL DEFAULT 0
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Full-text search on chunks
CREATE INDEX IF NOT EXISTS idx_book_chunks_fts ON ai_schema.book_chunks USING GIN (to_tsvector('english', chunk_text));

-- Book lookups
CREATE INDEX IF NOT EXISTS idx_books_grade_subject ON ai_schema.books(grade, subject);
CREATE INDEX IF NOT EXISTS idx_books_status ON ai_schema.books(status);
CREATE INDEX IF NOT EXISTS idx_books_branch ON ai_schema.books(branch_code);

-- Chunk lookups
CREATE INDEX IF NOT EXISTS idx_chunks_book_id ON ai_schema.book_chunks(book_id);
CREATE INDEX IF NOT EXISTS idx_chunks_file_id ON ai_schema.book_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_chunks_chapter ON ai_schema.book_chunks(chapter);

-- Generations
CREATE INDEX IF NOT EXISTS idx_generations_teacher ON ai_schema.generations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_generations_feature ON ai_schema.generations(feature);
CREATE INDEX IF NOT EXISTS idx_generations_created ON ai_schema.generations(created_at DESC);

-- Chat
CREATE INDEX IF NOT EXISTS idx_chat_session ON ai_schema.chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_teacher ON ai_schema.chat_history(teacher_id);

-- Usage
CREATE INDEX IF NOT EXISTS idx_usage_date ON ai_schema.usage_stats(date);
CREATE INDEX IF NOT EXISTS idx_usage_feature ON ai_schema.usage_stats(feature);

-- Retrieval logs
CREATE INDEX IF NOT EXISTS idx_retrieval_logs_created ON ai_schema.retrieval_logs(created_at DESC);

-- Embedding queue
CREATE INDEX IF NOT EXISTS idx_embedding_queue_status ON ai_schema.embedding_queue(status);

-- ============================================================
-- INSERT DEFAULT PROMPT TEMPLATES
-- ============================================================

INSERT INTO ai_schema.prompt_templates (name, feature, template, is_default, is_system) VALUES
('Default Lesson Plan', 'lesson_plan', 'You are an expert Ethiopian educator. Generate a detailed lesson plan based ONLY on the reference materials provided below. Do NOT use any outside knowledge.', true, true),
('Default Lesson Note', 'lesson_note', 'You are an expert Ethiopian educator. Generate comprehensive lesson notes based ONLY on the reference materials provided below.', true, true),
('Default Homework', 'homework', 'You are an expert Ethiopian educator. Generate a homework assignment based ONLY on the reference materials provided.', true, true),
('Default Worksheet', 'worksheet', 'You are an expert Ethiopian educator. Generate a classroom worksheet based ONLY on the reference materials provided.', true, true),
('Default Quiz', 'quiz', 'You are an expert Ethiopian educator. Generate a quiz based ONLY on the reference materials provided below.', true, true),
('Default Exam', 'exam', 'You are an expert Ethiopian educator. Generate an exam paper based ONLY on the reference materials provided below.', true, true);

-- ============================================================
-- INSERT USAGE STATS (initial seed for dashboard)
-- ============================================================

INSERT INTO ai_schema.usage_stats (date, feature, request_count) VALUES
(CURRENT_DATE, 'lesson_plan', 0),
(CURRENT_DATE, 'lesson_note', 0),
(CURRENT_DATE, 'homework', 0),
(CURRENT_DATE, 'worksheet', 0),
(CURRENT_DATE, 'quiz', 0),
(CURRENT_DATE, 'exam', 0),
(CURRENT_DATE, 'chat', 0);
