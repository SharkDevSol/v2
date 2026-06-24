-- KG Evaluation Module Tables
-- Creates tables for Kindergarten evaluation system
-- Column names match kgEvaluationRoutes.js

-- Evaluation areas
CREATE TABLE IF NOT EXISTS kg_evaluation_areas (
  id SERIAL PRIMARY KEY,
  area_name VARCHAR(200) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluation criteria
CREATE TABLE IF NOT EXISTS kg_evaluation_criteria (
  id SERIAL PRIMARY KEY,
  area_id INTEGER REFERENCES kg_evaluation_areas(id) ON DELETE CASCADE,
  criteria_name VARCHAR(300) NOT NULL,
  criteria_description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluation sessions
CREATE TABLE IF NOT EXISTS kg_evaluations (
  id SERIAL PRIMARY KEY,
  class_name VARCHAR(100) NOT NULL,
  term_number INTEGER NOT NULL,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student evaluation scores
CREATE TABLE IF NOT EXISTS kg_student_evaluations (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER REFERENCES kg_evaluations(id) ON DELETE CASCADE,
  student_name VARCHAR(200) NOT NULL,
  criteria_id INTEGER REFERENCES kg_evaluation_criteria(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rating VARCHAR(50),
  observation_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Developmental milestones
CREATE TABLE IF NOT EXISTS kg_developmental_milestones (
  id SERIAL PRIMARY KEY,
  milestone_name VARCHAR(300) NOT NULL,
  milestone_category VARCHAR(100),
  age_range VARCHAR(50),
  milestone_description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student milestone progress
CREATE TABLE IF NOT EXISTS kg_student_milestones (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(200) NOT NULL,
  class_name VARCHAR(100),
  milestone_id INTEGER REFERENCES kg_developmental_milestones(id) ON DELETE CASCADE,
  achieved BOOLEAN DEFAULT FALSE,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default evaluation areas and criteria
INSERT INTO kg_evaluation_areas (area_name, description, display_order) VALUES
  ('Motor Skills', 'Fine and gross motor skill development', 1),
  ('Social Skills', 'Interaction with peers and adults', 2),
  ('Cognitive Development', 'Thinking, reasoning, and problem-solving', 3),
  ('Language & Communication', 'Verbal and non-verbal communication', 4),
  ('Emotional Development', 'Self-awareness and emotional regulation', 5),
  ('Creative Arts', 'Creativity through art, music, and play', 6),
  ('Numeracy', 'Basic number concepts and counting', 7),
  ('Literacy', 'Pre-reading and pre-writing skills', 8)
ON CONFLICT DO NOTHING;

INSERT INTO kg_evaluation_criteria (area_id, criteria_name, display_order) 
SELECT a.id, c.name, c.sort FROM (
  VALUES 
    (1, 'Holds pencil/crayon correctly', 1),
    (1, 'Cuts with scissors', 2),
    (1, 'Pastes and glues neatly', 3),
    (1, 'Builds with blocks', 4),
    (1, 'Throws and catches ball', 5),
    (1, 'Balances on one foot', 6),
    (2, 'Shares with others', 1),
    (2, 'Takes turns', 2),
    (2, 'Follows classroom rules', 3),
    (2, 'Works cooperatively in groups', 4),
    (2, 'Respects personal space', 5),
    (3, 'Identifies colors', 1),
    (3, 'Identifies shapes', 2),
    (3, 'Sorts objects by attributes', 3),
    (3, 'Completes puzzles', 4),
    (3, 'Follows 2-3 step instructions', 5),
    (3, 'Shows curiosity and asks questions', 6),
    (4, 'Expresses needs verbally', 1),
    (4, 'Speaks in complete sentences', 2),
    (4, 'Follows oral directions', 3),
    (4, 'Participates in group discussions', 4),
    (4, 'Tells a simple story', 5),
    (5, 'Separates from caregiver easily', 1),
    (5, 'Shows self-confidence', 2),
    (5, 'Manages emotions appropriately', 3),
    (5, 'Shows empathy for others', 4),
    (5, 'Adapts to new situations', 5),
    (6, 'Enjoys art activities', 1),
    (6, 'Sings songs', 2),
    (6, 'Participates in dramatic play', 3),
    (6, 'Shows rhythm and movement', 4),
    (7, 'Counts 1-10', 1),
    (7, 'Recognizes numbers 1-10', 2),
    (7, 'Matches quantities to numbers', 3),
    (7, 'Understands bigger/smaller', 4),
    (8, 'Recognizes letters', 1),
    (8, 'Writes own name', 2),
    (8, 'Shows print awareness', 3),
    (8, 'Enjoys listening to stories', 4)
) AS c(area_num, name, sort)
JOIN kg_evaluation_areas a ON a.display_order = c.area_num
ON CONFLICT DO NOTHING;