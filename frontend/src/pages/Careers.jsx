import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Careers.css';

const Careers = () => {
  const { user } = useAuth();
  
  // Wizard State
  const [step, setStep] = useState(1); // 1: Locations, 2: Spec, 3: Upload/Match
  
  // Step 1: Locations (Max 3)
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  
  // Step 2: Job Specification
  const [jobSpec, setJobSpec] = useState('');
  
  // Step 3: Resume
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Matcher State
  const [matchingState, setMatchingState] = useState('idle'); // idle | matching | done
  const [logs, setLogs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);

  // --- Step 1 Handlers ---
  const handleAddLocation = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const loc = locationInput.trim();
      if (loc && selectedLocations.length < 3 && !selectedLocations.includes(loc)) {
        setSelectedLocations([...selectedLocations, loc]);
        setLocationInput('');
      }
    }
  };

  const removeLocation = (loc) => {
    setSelectedLocations(selectedLocations.filter(l => l !== loc));
  };

  const handleNextToSpec = () => {
    if (selectedLocations.length > 0) setStep(2);
  };

  // --- Step 2 Handlers ---
  const handleNextToUpload = () => {
    if (jobSpec.trim().length > 0) setStep(3);
  };

  // --- Step 3 Handlers (Upload & Match) ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      triggerMatchingSimulation(droppedFile.name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      triggerMatchingSimulation(selectedFile.name);
    }
  };

  const triggerMatchingSimulation = (fileName) => {
    setMatchingState('matching');
    setLogs([]);
    setMatchedJobs([]);

    const logMessages = [
      `[Sys] Initializing cognitive resume parsing engine...`,
      `[Sys] Extracting metrics from [${fileName}]...`,
      `[Filter] Applying Location Constraints: ${selectedLocations.join(', ')}`,
      `[Filter] Processing Job Spec: "${jobSpec.substring(0, 30)}..."`,
      `[NLP] Tokenizing and mapping skill vectors...`,
      `[Network] Aggregating live jobs matching criteria across platforms...`,
      `[Sys] Match found! Preparing results...`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logMessages.length) {
        setLogs(prev => [...prev, logMessages[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        generateDynamicMatches();
      }
    }, 800);
  };

  const generateDynamicMatches = () => {
    // Generate dynamic mock jobs based on the spec
    const keywords = jobSpec.split(' ').filter(w => w.length > 4).slice(0, 3);
    const titleBase = keywords.length > 0 ? keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1) : 'Technology';
    
    const jobRoles = ['Engineer', 'Specialist', 'Architect', 'Manager', 'Analyst', 'Consultant', 'Developer', 'Lead', 'Coordinator', 'Strategist', 'Director', 'Researcher'];
    const dynamicJobs = Array.from({ length: 12 }).map((_, i) => ({
      id: i + 1,
      title: `${i % 2 === 0 ? 'Senior ' : ''}${titleBase} ${jobRoles[i]}`,
      department: i % 3 === 0 ? 'Engineering' : i % 2 === 0 ? 'Product' : 'Operations',
      type: i % 4 === 0 ? 'Contract' : 'Full-Time',
      location: selectedLocations[i % selectedLocations.length] || 'Remote',
      desc: `Exciting opportunity for a ${titleBase} professional matching your specified criteria. Apply directly to aggregated openings across top tech companies.`,
      score: Math.floor(Math.random() * 20) + 75,
      matchedSkills: [titleBase, i % 2 === 0 ? 'Analytical' : 'Leadership', 'Communication'],
      missingSkills: [i % 3 === 0 ? 'Cloud Deployment' : 'Advanced Reporting']
    })).sort((a, b) => b.score - a.score);
    
    setMatchedJobs(dynamicJobs);
    setMatchingState('done');
  };

  const handleReset = () => {
    setStep(1);
    setSelectedLocations([]);
    setJobSpec('');
    setFile(null);
    setMatchingState('idle');
  };

  return (
    <div className="careers-root fade-in">
      <div className="careers-header" style={{ marginBottom: '2rem' }}>
        <span className="careers-eyebrow">APAIS Recruitment Portal</span>
        <h1 className="careers-title">AI Career Matcher Wizard</h1>
        <p className="careers-subtitle">
          Define your target criteria, upload your resume, and let our AI engine find the perfect match across all global aggregated job platforms.
        </p>
      </div>

      {/* Wizard Progress Tracker */}
      <div className="wizard-tracker" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ color: step >= 1 ? 'var(--color-cyan)' : 'var(--color-text-muted)', fontWeight: step >= 1 ? '700' : '500' }}>
          1. Location
        </div>
        <div style={{ color: 'var(--color-border)' }}>—</div>
        <div style={{ color: step >= 2 ? 'var(--color-purple)' : 'var(--color-text-muted)', fontWeight: step >= 2 ? '700' : '500' }}>
          2. Specifications
        </div>
        <div style={{ color: 'var(--color-border)' }}>—</div>
        <div style={{ color: step >= 3 ? '#10b981' : 'var(--color-text-muted)', fontWeight: step >= 3 ? '700' : '500' }}>
          3. Upload & Match
        </div>
      </div>

      {/* STEP 1: LOCATIONS */}
      {step === 1 && (
        <div className="careers-glass fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>Enter Target Locations</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Type and add up to 3 preferred job locations (e.g. "New York", "Remote"). ({selectedLocations.length}/3 selected)
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={handleAddLocation}
              placeholder="Type a location and press Enter..."
              disabled={selectedLocations.length >= 3}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--color-text-main)'
              }}
            />
            <button 
              onClick={handleAddLocation}
              disabled={selectedLocations.length >= 3 || !locationInput.trim()}
              className="upload-btn"
              style={{ margin: 0 }}
            >
              Add
            </button>
          </div>

          {selectedLocations.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
              {selectedLocations.map(loc => (
                <div key={loc} style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid var(--color-cyan)',
                  color: 'var(--color-cyan)',
                  padding: '0.5rem 1rem',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {loc}
                  <span onClick={() => removeLocation(loc)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>&times;</span>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={handleNextToSpec} 
            disabled={selectedLocations.length === 0}
            className="upload-btn"
            style={{ opacity: selectedLocations.length === 0 ? 0.5 : 1, width: '100%', marginTop: '1rem' }}
          >
            Continue to Specifications <span>→</span>
          </button>
        </div>
      )}

      {/* STEP 2: SPECIFICATIONS */}
      {step === 2 && (
        <div className="careers-glass fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>Job Specifications</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Describe your ideal role, skills, and any specific criteria (e.g., "React frontend developer with Go backend experience").
          </p>
          <textarea
            value={jobSpec}
            onChange={(e) => setJobSpec(e.target.value)}
            placeholder="Type your job specifications here..."
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--color-text-main)',
              marginBottom: '2rem',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setStep(1)} 
              className="upload-btn"
              style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', flex: 1 }}
            >
              Back
            </button>
            <button 
              onClick={handleNextToUpload} 
              disabled={jobSpec.trim().length === 0}
              className="upload-btn"
              style={{ flex: 2, opacity: jobSpec.trim().length === 0 ? 0.5 : 1 }}
            >
              Continue to Upload <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: UPLOAD & MATCH */}
      {step === 3 && (
        <div className="matcher-section careers-glass fade-in">
          {matchingState === 'idle' && (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
                Upload Resume to Match
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Your criteria: {selectedLocations.length} Locations • Custom Specs
              </p>
              <div 
                className={`upload-zone ${isDragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                <h3>Drag &amp; drop your resume files here</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0' }}>
                  Supports PDF, DOCX, TXT (Max 5MB)
                </p>
                <label className="upload-btn">
                  Browse Files
                  <input 
                    type="file" 
                    style={{ display: 'none' }} 
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                 <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', textDecoration: 'underline' }}>Back to Specifications</button>
              </div>
            </>
          )}

          {matchingState === 'matching' && (
            <div className="matching-loader-container">
              <div className="matching-spinner" />
              <h3>Analyzing Talent Profile...</h3>
              <div className="matching-logs">
                {logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {matchingState === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3 style={{ color: '#10b981' }}>Match Complete!</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Found {matchedJobs.length} roles matching your locations and specs.
              </p>
              <button 
                onClick={handleReset} 
                className="upload-btn" 
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', margin: '0' }}
              >
                Start New Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* MATCHED RESULTS */}
      {step === 3 && matchingState === 'done' && matchedJobs.length > 0 && (
        <div className="results-section">
          <div className="results-grid">
            {matchedJobs.map((job) => (
              <div className="match-card careers-glass" key={job.id}>
                <div>
                  <div className="match-score-radial">
                    <div className="score-badge">{job.score}%</div>
                    <div className="score-text">Match Score</div>
                  </div>
                  <h3 className="job-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{job.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                    💼 {job.department} • {job.type} • {job.location}
                  </p>
                  <p className="job-desc" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{job.desc}</p>

                  <div className="skills-group">
                    <h5>Matched Keywords</h5>
                    <div className="skills-list">
                      {job.matchedSkills.map((sk, idx) => (
                        <span className="skill-tag matched" key={idx}>✓ {sk}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="job-action-panel">
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(job.title + ' jobs in ' + job.location + ' ' + jobSpec.substring(0,30))}&ibp=htl;jobs`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="portal-link apais-apply"
                    style={{ justifyContent: 'center', textAlign: 'center', padding: '1.25rem' }}
                  >
                    <span>Apply to Openings ↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
