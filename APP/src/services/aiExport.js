import jsPDF from 'jspdf';

export function exportPDF(title, content, filename = 'document.pdf') {
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(18);
  doc.text(title, 20, y);
  y += 12;

  const addText = (label, text) => {
    if (!text) return;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(label, 20, y); y += 7;
    doc.setFontSize(10);
    doc.setTextColor(80);
    const lines = doc.splitTextToSize(String(text), 170);
    for (const l of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(l, 25, y);
      y += 5;
    }
    y += 4;
  };

  const addList = (label, items) => {
    if (!items || items.length === 0) return;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(label, 20, y); y += 7;
    doc.setFontSize(10);
    doc.setTextColor(80);
    for (const item of items) {
      if (y > 270) { doc.addPage(); y = 20; }
      const text = typeof item === 'string' ? item : (item.question || item.name || JSON.stringify(item));
      const lines = doc.splitTextToSize(`• ${text}`, 165);
      for (const l of lines) { doc.text(l, 25, y); y += 5; }
    }
    y += 4;
  };

  // Generic field extraction — works for any generator output
  if (content.learningObjectives) addList('Learning Objectives', content.learningObjectives);
  if (content.learningOutcomes) addList('Learning Outcomes', content.learningOutcomes);
  if (content.introduction) addText('Introduction', content.introduction);
  if (content.definition) addText('Definition', content.definition);
  if (content.explanation) addText('Explanation', content.explanation);
  if (content.summary) addText('Summary', content.summary);
  if (content.assessmentMethods) addText('Assessment', content.assessmentMethods);
  if (content.homework) addText('Homework', content.homework);
  if (content.teacherNotes) addText('Teacher Notes', content.teacherNotes);
  if (content.instructions) addText('Instructions', content.instructions);

  if (content.teachingProcedure) {
    addText('Teaching Procedure', '');
    for (const step of content.teachingProcedure) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Step ${step.step} (${step.duration})`, 25, y); y += 5;
      doc.setTextColor(80);
      const lines = doc.splitTextToSize(`Teacher: ${step.teacherActivity}`, 165);
      for (const l of lines) { doc.text(l, 30, y); y += 5; }
      const slines = doc.splitTextToSize(`Student: ${step.studentActivity}`, 165);
      for (const l of slines) { doc.text(l, 30, y); y += 5; }
      y += 3;
    }
  }

  if (content.examples) {
    addText('Examples', '');
    for (const ex of content.examples) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(ex.title || `Example`, 25, y); y += 5;
      doc.setTextColor(80);
      const lines = doc.splitTextToSize(ex.content || ex.solution || '', 165);
      for (const l of lines) { doc.text(l, 30, y); y += 5; }
      y += 3;
    }
  }

  if (content.questions) addList('Questions', content.questions);
  if (content.sections) {
    for (const sec of content.sections) {
      addText(sec.title || 'Section', sec.instructions || '');
      if (sec.questions) addList('', sec.questions);
    }
  }
  if (content.keywords) addList('Keywords', content.keywords);
  if (content.sources) addList('Sources', content.sources);

  doc.save(filename);
}

export function printContent(elementId) {
  const content = document.getElementById(elementId);
  if (!content) return;
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>Print</title><style>body{font-family:Arial;padding:40px;line-height:1.6}
    h2{color:#6c5ce7} h3{margin-top:20px} .step{margin:10px 0;padding:10px;background:#f8f8ff;border-left:3px solid #6c5ce7}
    @media print{body{padding:20px}}</style></head><body>${content.innerHTML}</body></html>`);
  win.document.close();
  win.print();
}

export function copyToClipboard(text) {
  try {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  } catch {
    const ta = document.createElement('textarea');
    ta.value = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}
