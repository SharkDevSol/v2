import { useState } from 'react';
import jsPDF from 'jspdf';
import styles from './AIContentGenerator.module.css';

const renderLessonPlan = (content) => {
  const lp = content.lessonPlan || content;
  return (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <h2>{lp.topic}</h2>
        <p>{lp.grade} — {lp.subject}</p>
        {lp.chapter && <p>Chapter: {lp.chapter}</p>}
      </div>

      <section className={styles.previewSection}>
        <h3>Learning Objectives</h3>
        <ul>
          {(lp.learningObjectives || []).map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </section>

      <section className={styles.previewSection}>
        <h3>Teaching Materials</h3>
        <ul>
          {(lp.teachingMaterials || []).map((mat, i) => (
            <li key={i}>{mat}</li>
          ))}
        </ul>
      </section>

      <section className={styles.previewSection}>
        <h3>Introduction</h3>
        <p>{lp.introduction}</p>
      </section>

      <section className={styles.previewSection}>
        <h3>Main Activities</h3>
        {(lp.mainActivities || []).map((act, i) => (
          <div key={i} className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <strong>Step {act.step}</strong>
              <span className={styles.duration}>{act.duration}</span>
            </div>
            <div className={styles.activityGrid}>
              <div>
                <strong>Teacher:</strong>
                <p>{act.teacherActivity}</p>
              </div>
              <div>
                <strong>Students:</strong>
                <p>{act.studentActivity}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h3>Assessment Method</h3>
        <p>{lp.assessmentMethod}</p>
      </section>

      <section className={styles.previewSection}>
        <h3>Summary</h3>
        <p>{lp.summary}</p>
      </section>

      <section className={styles.previewSection}>
        <h3>Homework</h3>
        <p>{lp.homework}</p>
      </section>

      {lp.timeAllocation && (
        <section className={styles.previewSection}>
          <h3>Time Allocation</h3>
          <table className={styles.timeTable}>
            <tbody>
              {Object.entries(lp.timeAllocation).map(([key, val]) => (
                key !== 'total' ? (
                  <tr key={key}>
                    <td>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                    <td>{val}</td>
                  </tr>
                ) : null
              ))}
              {lp.timeAllocation.total && (
                <tr className={styles.totalRow}>
                  <td><strong>Total</strong></td>
                  <td><strong>{lp.timeAllocation.total}</strong></td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

const renderLessonNote = (content) => {
  const ln = content.lessonNote || content;
  return (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <h2>{ln.topic}</h2>
        <p>{ln.grade} — {ln.subject}</p>
      </div>

      <section className={styles.previewSection}>
        <h3>Introduction</h3>
        <p>{ln.introduction}</p>
      </section>

      <section className={styles.previewSection}>
        <h3>Detailed Explanation</h3>
        {(ln.detailedExplanation || []).map((section, i) => (
          <div key={i} className={styles.explanationBlock}>
            <h4>{section.heading}</h4>
            <p>{section.content}</p>
            {section.keyPoints && (
              <ul>
                {section.keyPoints.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h3>Key Concepts</h3>
        <table className={styles.conceptTable}>
          <thead>
            <tr><th>Term</th><th>Definition</th></tr>
          </thead>
          <tbody>
            {(ln.keyConcepts || []).map((c, i) => (
              <tr key={i}><td><strong>{c.term}</strong></td><td>{c.definition}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.previewSection}>
        <h3>Examples</h3>
        {(ln.examples || []).map((ex, i) => (
          <div key={i} className={styles.exampleBlock}>
            <p><strong>Problem:</strong> {ex.problem}</p>
            <p><strong>Solution:</strong> {ex.solution}</p>
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h3>Classroom Activities</h3>
        {(ln.classroomActivities || []).map((act, i) => (
          <div key={i} className={styles.activityCard}>
            <h4>{act.activity}</h4>
            <p>{act.instructions}</p>
            <span className={styles.duration}>{act.duration}</span>
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h3>Important Notes</h3>
        <ul>
          {(ln.importantNotes || []).map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      </section>

      <section className={styles.previewSection}>
        <h3>Summary</h3>
        <p>{ln.summary}</p>
      </section>

      <section className={styles.previewSection}>
        <h3>Review Questions</h3>
        {(ln.reviewQuestions || []).map((q, i) => (
          <div key={i} className={styles.reviewQuestion}>
            <p><strong>Q{i + 1}:</strong> {q.question}</p>
            <p className={styles.answer}><strong>Answer:</strong> {q.expectedAnswer}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

const renderHomework = (content) => {
  const hw = content.homework || content;
  return (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <h2>Homework: {hw.topic}</h2>
        <p>{hw.grade} — {hw.subject}</p>
        {hw.chapter && <p>Chapter: {hw.chapter}</p>}
      </div>

      <section className={styles.previewSection}>
        <h3>Instructions</h3>
        <p>{hw.instructions}</p>
        <p className={styles.totalQuestions}>Total Questions: {hw.totalQuestions}</p>
      </section>

      <section className={styles.previewSection}>
        <h3>Questions</h3>
        {(hw.questions || []).map((q) => (
          <div key={q.id} className={styles.questionCard}>
            <p><strong>{q.id}.</strong> {q.question}</p>
            {q.options && (
              <div className={styles.optionsList}>
                {q.options.map((opt, i) => <p key={i}>{opt}</p>)}
              </div>
            )}
            <details className={styles.answerReveal}>
              <summary>Show Answer</summary>
              <p><strong>Answer:</strong> {q.correctAnswer}</p>
              {q.explanation && <p><strong>Explanation:</strong> {q.explanation}</p>}
            </details>
          </div>
        ))}
      </section>

      {hw.answerKey && (
        <section className={styles.previewSection}>
          <details>
            <summary><strong>Answer Key (Teacher Only)</strong></summary>
            <p>{hw.answerKey}</p>
          </details>
        </section>
      )}
    </div>
  );
};

const renderWorksheet = (content) => {
  const ws = content.worksheet || content;
  return (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <h2>Worksheet: {ws.topic}</h2>
        <p>{ws.grade} — {ws.subject}</p>
      </div>

      <div className={styles.worksheetMeta}>
        <p><strong>Name:</strong> {ws.studentName}</p>
        <p><strong>Date:</strong> {ws.date}</p>
      </div>

      <section className={styles.previewSection}>
        <h3>Instructions</h3>
        <p>{ws.instructions}</p>
      </section>

      {(ws.sections || []).map((section, i) => (
        <section key={i} className={styles.previewSection}>
          <h3>{section.title}</h3>
          <p className={styles.sectionInstructions}>{section.instructions}</p>
          <div className={styles.worksheetQuestions}>
            {(section.questions || []).map((q, j) => (
              <div key={j} className={styles.worksheetQuestion}>
                <p><strong>{q.id}.</strong> {q.question}</p>
                {q.hint && <p className={styles.hint}>💡 {q.hint}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      {ws.bonusChallenge && (
        <section className={styles.previewSection}>
          <h3>Bonus Challenge ⭐</h3>
          <p>{ws.bonusChallenge}</p>
        </section>
      )}
    </div>
  );
};

const renderExam = (content) => {
  const exam = content.exam || content;
  return (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <h2>{exam.title || exam.topic || 'Exam'}</h2>
        <p>{exam.grade} — {exam.subject}</p>
        {exam.totalMarks && <p>Total Marks: {exam.totalMarks}</p>}
      </div>

      <section className={styles.previewSection}>
        <h3>Instructions</h3>
        <p>{exam.instructions}</p>
      </section>

      <section className={styles.previewSection}>
        <h3>Questions</h3>
        {(exam.questions || []).map((q) => (
          <div key={q.id} className={styles.questionCard}>
            <p><strong>Q{q.id}.</strong> ({q.marks} marks) {q.question}</p>
            {q.type === 'multiple_choice' && q.options && (
              <div className={styles.optionsList}>
                {q.options.map((opt, i) => <p key={i}>{opt}</p>)}
              </div>
            )}
            <details className={styles.answerReveal}>
              <summary>Show Answer</summary>
              <p><strong>Answer:</strong> {q.correctAnswer}</p>
              {q.explanation && <p><strong>Explanation:</strong> {q.explanation}</p>}
            </details>
          </div>
        ))}
      </section>
    </div>
  );
};

const renderScrambleExam = (content) => {
  const se = content.scrambleExam || content;
  const versions = ['A', 'B', 'C'];

  return (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <h2>{se.title || 'Scramble Exam'}</h2>
        <p>{se.grade} — {se.subject}</p>
        {se.totalMarks && <p>Total Marks: {se.totalMarks}</p>}
        {se.timeLimit && <p>Time Limit: {se.timeLimit} minutes</p>}
      </div>

      <section className={styles.previewSection}>
        <h3>Instructions</h3>
        <p>{se.instructions}</p>
      </section>

      <div className={styles.versionTabs}>
        {versions.map((v) => (
          <div key={v} className={styles.versionTab}>
            <h3 className={styles.versionLabel}>
              Version {v} — {se.versions?.[v]?.label || `Version ${v}`}
            </h3>
            {se.versions?.[v]?.sections?.map((section, si) => (
              <div key={si} className={styles.versionSection}>
                <h4>Section {section.section}: {section.type.replace(/_/g, ' ')} ({section.totalMarks} marks)</h4>
                <p className={styles.sectionInstructions}>{section.instructions}</p>
                {(section.questions || []).map((q) => (
                  <div key={q.id} className={styles.questionCard}>
                    <p><strong>Q{q.id}.</strong> ({q.marks} marks) {q.question}</p>
                    {q.options && (
                      <div className={styles.optionsList}>
                        {q.options.map((opt, i) => <p key={i}>{opt}</p>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {se.answerKey && (
        <section className={styles.previewSection}>
          <details>
            <summary><strong>Answer Keys (Teacher Only)</strong></summary>
            {Object.entries(se.answerKey).map(([version, answers]) => (
              <div key={version}>
                <h4>Version {version}</h4>
                <p>{JSON.stringify(answers, null, 2)}</p>
              </div>
            ))}
          </details>
        </section>
      )}
    </div>
  );
};

const renderTest = (content) => {
  const test = content.test || content;
  return (
    <div className={styles.previewContent}>
      <div className={styles.previewHeader}>
        <h2>{test.title || `Test: ${test.topic || ''}`}</h2>
        <p>{test.grade} — {test.subject}</p>
        <p>Total Marks: {test.totalMarks} | Time: {test.timeLimit} minutes</p>
      </div>

      <section className={styles.previewSection}>
        <h3>Instructions</h3>
        <p>{test.instructions}</p>
      </section>

      {(test.sections || []).map((section, i) => (
        <section key={i} className={styles.previewSection}>
          <h3>Section {section.section}: {section.title} ({section.marks} marks)</h3>
          <p className={styles.sectionInstructions}>{section.instructions}</p>
          {(section.questions || []).map((q) => (
            <div key={q.id} className={styles.questionCard}>
              <p><strong>{q.id}.</strong> ({q.marks} marks) {q.question}</p>
              {q.options && (
                <div className={styles.optionsList}>
                  {q.options.map((opt, i) => <p key={i}>{opt}</p>)}
                </div>
              )}
              <details className={styles.answerReveal}>
                <summary>Show Answer</summary>
                <p><strong>Answer:</strong> {q.correctAnswer}</p>
                {q.explanation && <p><strong>Explanation:</strong> {q.explanation}</p>}
              </details>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

const renderByMode = (mode, data) => {
  const content = data?.output || data;
  switch (mode) {
    case 'lesson_plan': return renderLessonPlan(content);
    case 'lesson_note': return renderLessonNote(content);
    case 'homework': return renderHomework(content);
    case 'worksheet': return renderWorksheet(content);
    case 'exam': return renderExam(content);
    case 'test': return renderTest(content);
    case 'scramble_exam': return renderScrambleExam(content);
    default: return <p>Unknown mode: {mode}</p>;
  }
};

const ContentPreview = ({ mode, data, onSave, onRegenerate, onEdit, editing }) => {
  const [editableContent, setEditableContent] = useState(JSON.stringify(data?.output || data, null, 2));

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    alert('Content copied to clipboard!');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Content</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>${document.getElementById('preview-content')?.innerHTML || '<p>No content</p>'}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const contentEl = document.getElementById('preview-content');
    if (!contentEl) return;

    const textContent = contentEl.textContent || contentEl.innerText || '';
    const lines = textContent.split('\n').filter(l => l.trim());

    const pageWidth = 190;
    const margin = 10;
    let y = 20;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const title = lines[0] || 'Generated Content';
    pdf.text(title, pageWidth / 2, y, { align: 'center' });
    y += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) { y += 4; continue; }

      const wrappedLines = pdf.splitTextToSize(line, pageWidth - 2 * margin);
      wrappedLines.forEach(wl => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(wl, margin + 5, y);
        y += 6;
      });
    }

    pdf.save('generated-content.pdf');
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewToolbar}>
        <span className={styles.toolbarTitle}>Generated Content</span>
        <div className={styles.toolbarActions}>
          <button className={styles.toolButton} onClick={handleCopy}>Copy</button>
          <button className={styles.toolButton} onClick={handlePrint}>Print</button>
          <button className={styles.toolButton} onClick={handleDownloadPDF}>PDF</button>
          <button className={styles.toolButton} onClick={onEdit}>
            {editing ? 'View' : 'Edit JSON'}
          </button>
          <button className={styles.toolButton} onClick={onRegenerate}>Regenerate</button>
          <button className={styles.saveButton} onClick={onSave}>Approve & Save</button>
        </div>
      </div>

      <div className={styles.previewBody} id="preview-content">
        {editing ? (
          <textarea
            className={styles.editorTextarea}
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            rows={30}
          />
        ) : (
          renderByMode(mode, data)
        )}
      </div>
    </div>
  );
};

export default ContentPreview;
