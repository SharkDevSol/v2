-- Migration 018: AI Content Generation Tables
-- Stores AI-generated teaching content: lesson plans, lesson notes, homework, worksheets, exams, tests, scramble exams

CREATE TABLE IF NOT EXISTS ai_content (
    id SERIAL PRIMARY KEY,
    
    -- Content Mode
    mode VARCHAR(30) NOT NULL CHECK (mode IN (
        'lesson_plan', 'lesson_note', 'homework', 'worksheet', 'exam', 'test', 'scramble_exam'
    )),
    
    -- Teacher Info
    teacher_id INTEGER NOT NULL,
    
    -- Academic Context
    school VARCHAR(255),
    grade VARCHAR(50),
    class_id INTEGER,
    subject VARCHAR(255),
    chapter VARCHAR(255),
    language VARCHAR(30) DEFAULT 'English',
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    
    -- Configuration (JSON)
    config JSONB NOT NULL,
    
    -- Generated Content (JSON)
    output JSONB NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
    version INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (teacher_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Indexes for ai_content
CREATE INDEX idx_ai_content_teacher ON ai_content(teacher_id);
CREATE INDEX idx_ai_content_mode ON ai_content(mode);
CREATE INDEX idx_ai_content_class ON ai_content(class_id);
CREATE INDEX idx_ai_content_subject ON ai_content(subject);
CREATE INDEX idx_ai_content_status ON ai_content(status);
CREATE INDEX idx_ai_content_created_at ON ai_content(created_at);

-- Update ai_content updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_content_updated_at
    BEFORE UPDATE ON ai_content
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_content_updated_at();

COMMENT ON TABLE ai_content IS 'Stores AI-generated teaching content for all content modes';
COMMENT ON COLUMN ai_content.mode IS 'Content type: lesson_plan, lesson_note, homework, worksheet, exam, test, scramble_exam';
COMMENT ON COLUMN ai_content.config IS 'Input configuration used to generate the content';
COMMENT ON COLUMN ai_content.output IS 'Generated content output in structured JSON format';
