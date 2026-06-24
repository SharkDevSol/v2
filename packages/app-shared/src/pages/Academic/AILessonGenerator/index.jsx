import React from 'react';
import { useNavigate } from 'react-router-dom';

const AILessonLanding = () => {
  const navigate = useNavigate();
  const modes = [
    { id: 'lesson-plan', title: 'Lesson Plan', desc: 'Professional lesson plans with objectives, activities, assessment', icon: '📝', color: '#667eea' },
    { id: 'lesson-note', title: 'Lesson Note', desc: 'Detailed teacher notes with explanations and examples', icon: '📖', color: '#10b981' },
    { id: 'homework', title: 'Homework', desc: 'Homework with MCQ, short answer, true/false, fill blanks', icon: '📚', color: '#f59e0b' },
    { id: 'worksheet', title: 'Worksheet', desc: 'Printable worksheets with exercises, matching, identification', icon: '📄', color: '#ef4444' },
    { id: 'scramble-exam', title: 'Scramble Exam', desc: '3 shuffled versions (A, B, C) for anti-cheating', icon: '🔀', color: '#8b5cf6' },
    { id: 'ai-test-generator', title: 'Test Generator', desc: 'Standard exams with 9 question types', icon: '🧪', color: '#06b6d4' },
    { id: 'book-upload', title: 'Book Upload', desc: 'Upload books and syllabi for AI context', icon: '📤', color: '#14b8a6' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>AI Educational Tools</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Powered by DeepSeek AI — generate curriculum-aligned materials for Ethiopian schools</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {modes.map(m => (
          <div key={m.id} onClick={() => navigate('/' + m.id)} style={{
            background: 'white', borderRadius: 16, padding: 24, cursor: 'pointer',
            border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>{m.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: m.color, marginBottom: 8 }}>{m.title}</h3>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AILessonLanding;
