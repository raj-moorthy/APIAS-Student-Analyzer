import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─── tiny animated KPI card ─── */
const KpiCard = ({ icon, label, value, sub, color = 'primary', delay = 0 }) => {
  const isLongValue = typeof value === 'string' && value.length > 6;
  return (
    <div className="kpi-card glassmorphism" style={{ animationDelay: `${delay}ms` }}>
      <div className={`kpi-icon kpi-icon--${color}`}>{icon}</div>
      <div className="kpi-body" style={{ minWidth: 0, flex: 1 }}>
        <div className={`kpi-value ${isLongValue ? 'kpi-value--long' : ''}`} title={value}>
          {value}
        </div>
        <div className="kpi-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>
          {label}
        </div>
        {sub && (
          <div className="kpi-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sub}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── collapsible section wrapper ─── */
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`analytics-section ${open ? 'section-open' : 'section-closed'}`}>
      <button className="section-toggle" onClick={() => setOpen(o => !o)}>
        <span>{icon} {title}</span>
        <span className={`toggle-chevron ${open ? 'chevron-up' : ''}`}>▾</span>
      </button>
      <div className="section-body">{children}</div>
    </div>
  );
};

/* ─── horizontal score bar ─── */
const ScoreBar = ({ label, score, max = 100, delay = 0 }) => {
  const pct = Math.min(Math.round((score / max) * 100), 100);
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="score-bar-row" style={{ animationDelay: `${delay}ms` }}>
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: color, '--target-w': `${pct}%` }}
        />
      </div>
      <span className="score-bar-pct" style={{ color }}>{pct}%</span>
    </div>
  );
};

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'History', 'Economics', 'Geography',
];

/* ─── Dynamic Asset Loaders for XLSX & PDFJS ─── */
const loadSheetJS = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Failed to load Excel parsing engine from CDN.'));
    document.head.appendChild(script);
  });
};

const loadPDFJS = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF parsing engine from CDN.'));
    document.head.appendChild(script);
  });
};

/* ─── Client-Side Parsers ─── */
const parseLocalCSV = (text) => {
  const parsed = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/[,\t;]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 3) continue;
    
    const [subject, examName, score, maxScore = '100'] = parts;
    
    if (
      subject.toLowerCase().includes('subject') || 
      examName.toLowerCase().includes('exam') || 
      score.toLowerCase().includes('score')
    ) {
      continue;
    }
    
    const numScore = parseFloat(score);
    const numMaxScore = parseFloat(maxScore);
    
    if (isNaN(numScore) || isNaN(numMaxScore)) continue;
    
    parsed.push({
      subject: subject || 'General',
      examName: examName || 'Exam',
      score: numScore,
      maxScore: numMaxScore > 0 ? numMaxScore : 100
    });
  }
  return parsed;
};

const parseLocalExcel = async (file) => {
  const XLSX = await loadSheetJS();
  const data = new Uint8Array(await file.arrayBuffer());
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  const parsed = [];
  let subjectCol = 0, examCol = 1, scoreCol = 2, maxScoreCol = 3;
  
  if (rows.length > 0) {
    const firstRow = rows[0].map(c => String(c || '').toLowerCase());
    const subIdx = firstRow.findIndex(c => c.includes('sub'));
    const exIdx = firstRow.findIndex(c => c.includes('exam') || c.includes('test') || c.includes('name'));
    const scIdx = firstRow.findIndex(c => c.includes('score') || c.includes('mark') || c.includes('your'));
    const mxIdx = firstRow.findIndex(c => c.includes('max') || c.includes('total'));
    
    if (subIdx !== -1) subjectCol = subIdx;
    if (exIdx !== -1) examCol = exIdx;
    if (scIdx !== -1) scoreCol = scIdx;
    if (mxIdx !== -1) maxScoreCol = mxIdx;
  }
  
  const startIdx = rows.length > 1 && (subjectCol !== 0 || examCol !== 1 || scoreCol !== 2) ? 1 : 0;
  
  for (let i = startIdx; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    
    const subject = String(row[subjectCol] || '').trim();
    const examName = String(row[examCol] || '').trim();
    const scoreVal = parseFloat(row[scoreCol]);
    let maxScoreVal = parseFloat(row[maxScoreCol]);
    
    if (isNaN(maxScoreVal) || maxScoreVal <= 0) maxScoreVal = 100;
    
    if (!subject || !examName || isNaN(scoreVal)) continue;
    
    parsed.push({
      subject,
      examName,
      score: scoreVal,
      maxScore: maxScoreVal
    });
  }
  return parsed;
};

const parseLocalPDF = async (file) => {
  const pdfjsLib = await loadPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let textLines = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const items = textContent.items;
    let linesMap = {};
    items.forEach(item => {
      const y = Math.round(item.transform[5]);
      if (!linesMap[y]) linesMap[y] = [];
      linesMap[y].push(item);
    });
    
    const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
    sortedY.forEach(y => {
      const lineItems = linesMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = lineItems.map(item => item.str).join(' ').trim();
      if (lineText) textLines.push(lineText);
    });
  }
  
  const parsed = [];
  textLines.forEach(line => {
    const scoreRegex = /(\d+(?:\.\d+)?)\s*(?:\/|of|out of|grade:|marks:)\s*(\d+(?:\.\d+)?)/i;
    const match = line.match(scoreRegex);
    
    if (match) {
      const score = parseFloat(match[1]);
      const maxScore = parseFloat(match[2]);
      const beforeScore = line.substring(0, match.index).trim().replace(/[:-]$/, '').trim();
      if (beforeScore.length > 3) {
        let subject = beforeScore;
        let examName = 'Exam';
        
        const matchSubject = SUBJECT_OPTIONS.find(s => beforeScore.toLowerCase().includes(s.toLowerCase()));
        if (matchSubject) {
          subject = matchSubject;
          examName = beforeScore.replace(new RegExp(matchSubject, 'i'), '').trim().replace(/^[-\s:|]+/, '').trim() || 'Final';
        } else {
          const dividers = ['-', ':', '|', '–'];
          for (const d of dividers) {
            if (beforeScore.includes(d)) {
              const parts = beforeScore.split(d).map(p => p.trim());
              subject = parts[0];
              examName = parts.slice(1).join(' ');
              break;
            }
          }
        }
        
        parsed.push({
          subject: subject.substring(0, 50),
          examName: examName.substring(0, 50) || 'Final Exam',
          score,
          maxScore: maxScore > 0 ? maxScore : 100
        });
      }
    } else {
      const simpleRegex = /(.*)\s+(\d+(?:\.\d+)?)\s*$/;
      const simpleMatch = line.match(simpleRegex);
      if (simpleMatch) {
        const textPart = simpleMatch[1].trim();
        const score = parseFloat(simpleMatch[2]);
        
        if (textPart.length > 3 && !/^\d+$/.test(textPart)) {
          let subject = textPart;
          let examName = 'Exam';
          
          const matchSubject = SUBJECT_OPTIONS.find(s => textPart.toLowerCase().includes(s.toLowerCase()));
          if (matchSubject) {
            subject = matchSubject;
            examName = textPart.replace(new RegExp(matchSubject, 'i'), '').trim().replace(/^[-\s:|]+/, '').trim() || 'Final';
          }
          
          parsed.push({
            subject: subject.substring(0, 50),
            examName: examName.substring(0, 50) || 'Assessment',
            score,
            maxScore: 100
          });
        }
      }
    }
  });
  
  return parsed;
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

const parseWithGemini = async (file, apiKey) => {
  const base64Data = await fileToBase64(file);
  const mimeType = file.type || 'application/octet-stream';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Extract all exam grades and marksheet records from this file. Return ONLY a valid JSON array of objects, with keys: \"subject\", \"examName\", \"score\", \"maxScore\". Ensure \"score\" and \"maxScore\" are numbers (floats). Do not include any markdown wrap or explanation, just the raw JSON array. Example: [{\"subject\": \"Mathematics\", \"examName\": \"Midterm\", \"score\": 85.5, \"maxScore\": 100}]"
            },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to call Gemini AI API.');
  }
  
  const result = await response.json();
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) throw new Error('No content returned from Gemini.');
  
  let cleanedJsonText = textResponse.trim();
  if (cleanedJsonText.startsWith('```')) {
    cleanedJsonText = cleanedJsonText.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  }
  
  const data = JSON.parse(cleanedJsonText);
  if (!Array.isArray(data)) throw new Error('AI did not return a list of grades.');
  
  return data.map(item => ({
    subject: String(item.subject || 'General').substring(0, 50),
    examName: String(item.examName || 'Assessment').substring(0, 50),
    score: parseFloat(item.score) || 0,
    maxScore: parseFloat(item.maxScore) || 100
  }));
};

const Analytics = () => {
  const { user } = useAuth();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [marks, setMarks]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const [markForm, setMarkForm] = useState({
    subject: '',
    examName: '',
    score: '',
    maxScore: '100',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [sheetUploading, setSheetUploading] = useState(false);
  const [sheetMsg, setSheetMsg]             = useState('');

  // New Marksheet Parsing States
  const [parsedPreview, setParsedPreview]   = useState([]); // List of grades to preview: [{ subject, examName, score, maxScore }]
  const [importingPreview, setImportingPreview] = useState(false);

  /* ── fetch ── */
  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [aRes, mRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/performance`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks`,       { headers }),
      ]);

      if (!aRes.ok) throw new Error('Failed to load performance metrics');
      if (!mRes.ok) throw new Error('Failed to load recorded grades');

      setAnalyticsData(await aRes.json());
      setMarks(await mRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── add mark ── */
  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    if (!markForm.examName || !markForm.score || !markForm.subject) return;
    setFormLoading(true);
    setFormSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject:  markForm.subject,
          examName: markForm.examName,
          score:    parseFloat(markForm.score),
          maxScore: parseFloat(markForm.maxScore),
          date:     new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to save grade');
      setFormSuccess(true);
      setMarkForm({ subject: '', examName: '', score: '', maxScore: '100' });
      await fetchAll();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  /* ── delete mark ── */
  const handleMarkDelete = async (id) => {
    if (!window.confirm('Remove this grade entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── parse & preview marksheet (local parsers only — no API key needed) ── */
  const handleMarksheetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSheetUploading(true);
    setSheetMsg('');
    setParsedPreview([]);

    try {
      let results = [];
      const name = file.name.toLowerCase();

      if (name.endsWith('.csv') || name.endsWith('.txt')) {
        // Plain text — safe to read as text
        const text = await file.text();
        results = parseLocalCSV(text);
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        // Binary Excel — parsed via SheetJS (CDN, binary-safe)
        results = await parseLocalExcel(file);
      } else if (name.endsWith('.pdf')) {
        // Binary PDF — parsed via PDF.js (CDN, binary-safe)
        results = await parseLocalPDF(file);
      } else {
        throw new Error('Unsupported format. Please upload a CSV, TXT, Excel (.xlsx/.xls), or PDF file.');
      }

      if (!results || results.length === 0) {
        throw new Error(
          'No grades could be extracted. Make sure the file has columns: Subject, Exam Name, Score, Max Score.'
        );
      }

      setParsedPreview(results);
      setSheetMsg(`📊 ${results.length} grade(s) found — review and confirm below.`);
    } catch (err) {
      setSheetMsg(`❌ ${err.message}`);
    } finally {
      setSheetUploading(false);
      e.target.value = '';
    }
  };

  /* ── confirm and import previewed marks ── */
  const handleConfirmImport = async () => {
    if (!parsedPreview.length) return;
    setImportingPreview(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let imported = 0;
      
      for (const item of parsedPreview) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              subject: item.subject,
              examName: item.examName,
              score: item.score,
              maxScore: item.maxScore,
              date: new Date().toISOString()
            }),
          });
          if (res.ok) imported++;
        } catch (err) {
          console.error('Failed to import item', item, err);
        }
      }
      
      await fetchAll();
      setSheetMsg(`✅ Successfully imported ${imported} out of ${parsedPreview.length} grades!`);
      setParsedPreview([]);
      setTimeout(() => setSheetMsg(''), 5000);
    } catch (err) {
      setError(`Failed to complete import: ${err.message}`);
    } finally {
      setImportingPreview(false);
    }
  };

  const handleRemovePreviewItem = (index) => {
    setParsedPreview(prev => prev.filter((_, idx) => idx !== index));
  };

  /* ── derive per-subject averages for bar chart ── */
  const subjectAverages = React.useMemo(() => {
    if (!marks.length) return [];
    const map = {};
    marks.forEach(m => {
      if (!map[m.subject]) map[m.subject] = { total: 0, maxTotal: 0, count: 0 };
      map[m.subject].total    += m.score;
      map[m.subject].maxTotal += m.maxScore;
      map[m.subject].count    += 1;
    });
    return Object.entries(map).map(([subject, { total, maxTotal }]) => ({
      subject,
      pct: Math.round((total / maxTotal) * 100),
    })).sort((a, b) => b.pct - a.pct);
  }, [marks]);

  if (!user) return null;
  if (loading) return <div className="analytics-loading">Compiling Academic Performance Profile…</div>;

  return (
    <div className="analytics-container fade-in">

      {/* ── KPI Row ── */}
      <div className="kpi-row">
        <KpiCard
          icon="📊" color="primary" delay={0}
          label="Overall Average" value={`${analyticsData?.overallScore || 0}%`}
          sub="Weighted GPA index"
        />
        <KpiCard
          icon="📝" color="accent" delay={80}
          label="Exams Recorded" value={marks.length}
          sub="Total assessments"
        />
        <KpiCard
          icon="🏆" color="success" delay={160}
          label="Strongest Subject"
          value={analyticsData?.strengths?.[0] || '—'}
          sub="Above 80% average"
        />
        <KpiCard
          icon="⚠️" color="danger" delay={240}
          label="Needs Attention"
          value={analyticsData?.improvementAreas?.[0] || '—'}
          sub="Below 70% average"
        />
        <KpiCard
          icon="🧠" color="warning" delay={320}
          label="Learning Style"
          value={analyticsData?.learningStyle || 'Adaptive'}
          sub="Cognitive profile"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Marksheet Upload Panel ── */}
      <div className="marksheet-upload-panel glassmorphism">
        <div className="marksheet-upload-info">
          <span className="marksheet-icon">📄</span>
          <div>
            <h3>Upload Marksheet</h3>
            <p>Supports CSV, Excel (.xlsx / .xls), PDF, and plain text files. Grades are extracted automatically.</p>
            <div className="format-badges">
              <span className="format-badge csv">.CSV</span>
              <span className="format-badge excel">.XLSX / .XLS</span>
              <span className="format-badge pdf">.PDF</span>
              <span className="format-badge text">.TXT</span>
            </div>
          </div>
        </div>

        <div className="marksheet-upload-action">
          {sheetMsg && <span className="sheet-success-msg">{sheetMsg}</span>}
          <label className="marksheet-upload-btn" htmlFor="marksheetInput">
            {sheetUploading ? '⏳ Parsing...' : '📂 Upload Files'}
          </label>
          <input
            id="marksheetInput" type="file"
            style={{ display: 'none' }}
            onChange={handleMarksheetUpload}
            disabled={sheetUploading}
            accept=".csv,.txt,.xlsx,.xls,.pdf"
          />
        </div>
      </div>

      {/* ── Preview Panel for parsed grades before final database save ── */}
      {parsedPreview.length > 0 && (
        <div className="parsed-preview-panel glassmorphism fade-in">
          <div className="preview-header">
            <div className="preview-header-title">
              <span className="preview-icon">📋</span>
              <div>
                <h3>Verify Parsed Grades</h3>
                <p>Review the extracted grades before importing them into your Academic Profile.</p>
              </div>
            </div>
            <span className="preview-badge">{parsedPreview.length} grades found</span>
          </div>

          <div className="preview-list-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Assessment / Exam</th>
                  <th>Score</th>
                  <th>Max Score</th>
                  <th>Percentage</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {parsedPreview.map((item, index) => {
                  const pct = Math.round((item.score / item.maxScore) * 100);
                  const color = pct >= 80 ? 'var(--color-success)' : pct >= 70 ? 'var(--color-cyan)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
                  return (
                    <tr key={index} className="preview-row animate-slide-in">
                      <td>
                        <select 
                          value={SUBJECT_OPTIONS.includes(item.subject) ? item.subject : 'General'} 
                          onChange={(e) => {
                            const updated = [...parsedPreview];
                            updated[index].subject = e.target.value;
                            setParsedPreview(updated);
                          }}
                        >
                          <option value="General">General / Custom</option>
                          {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {!SUBJECT_OPTIONS.includes(item.subject) && (
                          <input 
                            type="text" 
                            value={item.subject} 
                            onChange={(e) => {
                              const updated = [...parsedPreview];
                              updated[index].subject = e.target.value;
                              setParsedPreview(updated);
                            }}
                            className="custom-subject-input"
                          />
                        )}
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={item.examName} 
                          onChange={(e) => {
                            const updated = [...parsedPreview];
                            updated[index].examName = e.target.value;
                            setParsedPreview(updated);
                          }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.score} 
                          onChange={(e) => {
                            const updated = [...parsedPreview];
                            updated[index].score = parseFloat(e.target.value) || 0;
                            setParsedPreview(updated);
                          }}
                          style={{ width: '70px' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.maxScore} 
                          onChange={(e) => {
                            const updated = [...parsedPreview];
                            updated[index].maxScore = parseFloat(e.target.value) || 100;
                            setParsedPreview(updated);
                          }}
                          style={{ width: '70px' }}
                        />
                      </td>
                      <td style={{ color, fontWeight: '700' }}>
                        {pct}%
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="preview-remove-btn" 
                          onClick={() => handleRemovePreviewItem(index)}
                          title="Exclude from import"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="preview-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => {
                setParsedPreview([]);
                setSheetMsg('❌ Import cancelled.');
                setTimeout(() => setSheetMsg(''), 3000);
              }}
            >
              ✕ Clear Preview
            </button>
            <button 
              type="button" 
              className="btn-confirm" 
              disabled={importingPreview}
              onClick={handleConfirmImport}
            >
              {importingPreview ? '⏳ Saving grades...' : '✅ Save all to Dashboard'}
            </button>
          </div>
        </div>
      )}

      {/* ── Subject Performance Bars ── */}
      {subjectAverages.length > 0 && (
        <Section title="Subject Performance Overview" icon="📊">
          <div className="subject-bars-grid">
            {subjectAverages.map((s, i) => (
              <ScoreBar key={s.subject} label={s.subject} score={s.pct} delay={i * 60} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Two-column layout ── */}
      <div className="analytics-split">

        {/* LEFT */}
        <div className="analytics-left">

          {/* Add grade form */}
          <Section title="Add Exam Grade" icon="📝">
            {formSuccess && <div className="alert alert-success">Grade saved successfully!</div>}
            <form onSubmit={handleMarkSubmit} className="grade-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    list="analytics-subjects"
                    name="subject"
                    value={markForm.subject}
                    onChange={e => setMarkForm(p => ({ ...p, subject: e.target.value }))}
                    required
                    placeholder="e.g. Mathematics"
                  />
                  <datalist id="analytics-subjects">
                    {SUBJECT_OPTIONS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Exam / Test Name</label>
                  <input
                    type="text"
                    value={markForm.examName}
                    onChange={e => setMarkForm(p => ({ ...p, examName: e.target.value }))}
                    required placeholder="e.g. Midterm, Quiz 3"
                  />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Your Score</label>
                  <input
                    type="number" step="0.5" min="0"
                    value={markForm.score}
                    onChange={e => setMarkForm(p => ({ ...p, score: e.target.value }))}
                    required placeholder="e.g. 85"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Score</label>
                  <input
                    type="number" step="0.5" min="1"
                    value={markForm.maxScore}
                    onChange={e => setMarkForm(p => ({ ...p, maxScore: e.target.value }))}
                    required placeholder="e.g. 100"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? 'Saving…' : '＋ Add Exam Score'}
              </button>
            </form>
          </Section>

          {/* Grades table */}
          <Section title="Recorded Grades Manager" icon="📋" defaultOpen={marks.length > 0}>
            {marks.length > 0 ? (
              <div className="grades-table-container">
                <table className="premium-grades-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam</th>
                      <th>Score</th>
                      <th>%</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m) => {
                      const pct = Math.round((m.score / m.maxScore) * 100);
                      return (
                        <tr key={m.id}>
                          <td className="font-bold">{m.subject}</td>
                          <td>{m.examName}</td>
                          <td>{m.score}/{m.maxScore}</td>
                          <td className={`font-bold ${pct >= 80 ? 'text-green' : pct < 70 ? 'text-red' : 'text-yellow'}`}>
                            {pct}%
                          </td>
                          <td>
                            <button onClick={() => handleMarkDelete(m.id)} className="btn-danger btn-sm">✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data-hint">No grades recorded yet. Add your first exam above.</p>
            )}
          </Section>
        </div>

        {/* RIGHT */}
        <div className="analytics-right">

          {/* Study Plan */}
          <Section title="Actionable Study Plan" icon="🎯">
            <div className="plan-steps-list">
              {analyticsData?.studyPlan?.length > 0 ? (
                analyticsData.studyPlan.map((step, idx) => (
                  <div className="plan-step-item" key={idx} style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="step-number-badge">{idx + 1}</div>
                    <div className="step-content">
                      <div className="step-header">
                        <h4>{step.step}</h4>
                        <span className={`priority-tag ${step.priority?.toLowerCase()}`}>
                          {step.priority}
                        </span>
                      </div>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data-hint">Log multiple exam grades to generate your personalised study plan.</p>
              )}
            </div>
          </Section>

          {/* Recommendations */}
          <Section title="Performance Recommendations" icon="💡" defaultOpen={false}>
            <ul className="recommendations-bullets">
              {analyticsData?.recommendations?.length > 0 ? (
                analyticsData.recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <span className="bullet-star">✨</span>
                    <p>{rec}</p>
                  </li>
                ))
              ) : (
                <li><p className="no-data-hint">Recommendations appear once grades are recorded.</p></li>
              )}
            </ul>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default Analytics;