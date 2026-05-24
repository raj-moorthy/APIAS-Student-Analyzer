/* =========================================
   APAIS – Page Renderers (Pages 5-8)
   ========================================= */

/* ---- 5. GOAL OPTIMIZATION ---- */
function renderGoals() {
    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div><h1 class="page-title">Goal Optimization</h1><p class="page-subtitle">AI-driven academic target calibration</p></div>
    <button class="btn btn-accent btn-sm" onclick="showAILoading()">🎯 Recalculate Goals</button>
  </div>
</div>

<div class="goal-hero section-gap">
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
    <div>
      <div style="font-size:13px;opacity:0.75;margin-bottom:6px">Current Academic Goal</div>
      <div class="goal-score">
        <div class="goal-score-num">87<span style="font-size:24px">%</span></div>
        <div class="goal-score-label">Target Final Score</div>
      </div>
      <div style="margin-top:12px;font-size:13px;opacity:0.75">Based on current trajectory, AI predicts: <strong>91%</strong> is achievable</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px 20px;text-align:center">
        <div style="font-size:22px;font-weight:800">14</div>
        <div style="font-size:12px;opacity:0.7">Weeks Remaining</div>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px 20px;text-align:center">
        <div style="font-size:22px;font-weight:800">+4%</div>
        <div style="font-size:12px;opacity:0.7">Required Gain</div>
      </div>
    </div>
  </div>
</div>

<div class="grid-2 section-gap">
  <!-- Adjustments -->
  <div class="card">
    <div class="card-header"><div class="card-title">🤖 AI Suggested Adjustments</div></div>
    <div class="ai-plan-card" style="margin:0">
      ${[
            'Increase Math study time by 1.5h/week to close the 68% gap in Integration.',
            'Add 2 DBMS mock tests per week — your test score improves 12% per test practice.',
            'Reduce social activity by 30 min weekdays to gain 2.5 additional study hours.',
            'Review OS notes on weekends; currently 0% weekend OS coverage detected.',
        ].map(t => `<div class="ai-plan-item"><div class="ai-dot"></div><div class="ai-plan-text">${t}</div></div>`).join('')}
    </div>
  </div>

  <!-- Study Intensity -->
  <div class="card">
    <div class="card-header"><div class="card-title">⚡ Study Intensity</div><div class="card-subtitle">Drag to adjust your weekly target</div></div>
    <div style="display:flex;flex-direction:column;gap:22px;margin-top:4px">
      ${[['Daily Study Hours', '4', '2', '8', 'h'], ['Weekly Test Practice', '3', '0', '7', 'tests'], ['Focus Sessions / Day', '2', '1', '6', 'sessions']].map(([l, v, mn, mx, u]) => `
        <div class="slider-container">
          <div class="flex justify-between items-center mb-4">
            <span style="font-size:13px;font-weight:500;color:var(--text-secondary)">${l}</span>
            <span class="badge badge-accent" id="sliderVal-${l.replace(/ /g, '')}">${v} ${u}</span>
          </div>
          <input type="range" class="range-slider" min="${mn}" max="${mx}" value="${v}"
            oninput="document.getElementById('sliderVal-${l.replace(/ /g, '')}').textContent=this.value+' ${u}'" />
          <div class="range-labels"><span>${mn} ${u}</span><span>${mx} ${u}</span></div>
        </div>`).join('')}
    </div>
  </div>
</div>

<!-- Weekly Targets + Burnout -->
<div class="grid-2 section-gap">
  <div class="card">
    <div class="card-header"><div class="card-title">📈 Weekly Target Tracker</div></div>
    <div style="display:flex;flex-direction:column;gap:14px">
      ${[['Data Structures', '85%', 85, '#06B6D4'], ['DBMS', '70%', 70, '#1E3A8A'], ['OS', '75%', 75, '#14B8A6'], ['Math', '72%', 72, '#F59E0B'], ['AI/ML', '90%', 90, '#8B5CF6'], ['CN', '78%', 78, '#3B82F6']].map(([s, t, p, c]) => `
        <div>
          <div class="flex justify-between" style="font-size:13px;margin-bottom:5px">
            <span style="font-weight:500">${s}</span>
            <span style="color:var(--text-muted)">Target ${t}</span>
          </div>
          <div class="progress"><div class="progress-fill" style="width:${p}%;background:${c}"></div></div>
        </div>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">🧠 Burnout Risk Indicator</div></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="burnout-indicator burnout-low">
        <div style="font-weight:700;color:var(--success);margin-bottom:4px">🟢 Low Risk — Current Load</div>
        <div style="font-size:13px;color:var(--text-secondary)">Your current schedule of 4.2h/day is sustainable. Consistency score: 88%</div>
      </div>
      <div class="burnout-indicator burnout-med">
        <div style="font-weight:700;color:var(--warning);margin-bottom:4px">🟡 Medium Risk — If Intensity +20%</div>
        <div style="font-size:13px;color:var(--text-secondary)">Pushing to 5h/day could strain you by Week 8. Take breaks on weekends.</div>
      </div>
      <div class="burnout-indicator burnout-high">
        <div style="font-weight:700;color:var(--danger);margin-bottom:4px">🔴 High Risk — Maximum Mode</div>
        <div style="font-size:13px;color:var(--text-secondary)">7h/day is unsustainable. AI recommends capping at 5.5h for optimal output.</div>
      </div>
      <div style="margin-top:4px">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">Current Burnout Score</div>
        <div class="progress" style="height:10px"><div class="progress-fill success" style="width:28%"></div></div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">28 / 100 — You're in the safe zone</div>
      </div>
    </div>
  </div>
</div>`;
}

/* ---- 6. STUDY LOGS ---- */
function renderLogs() {
    const logs = [
        { date: 'Feb 28', 'subject': 'Data Structures', 'hours': 4, 'focus': 5, 'notes': 'Completed BFS/DFS graphs. Reviewed Dijkstra algorithm.' },
        { date: 'Feb 27', 'subject': 'DBMS', 'hours': 3, 'focus': 3, 'notes': 'Normalization forms — struggled with BCNF.' },
        { date: 'Feb 26', 'subject': 'AI/ML', 'hours': 5, 'focus': 5, 'notes': 'Neural networks backpropagation deep dive. Very productive.' },
        { date: 'Feb 25', 'subject': 'Math', 'hours': 2, 'focus': 2, 'notes': 'Integration exercises — had difficulty with complex integrals.' },
        { date: 'Feb 24', 'subject': 'OS', 'hours': 3.5, 'focus': 4, 'notes': 'Process scheduling algorithms, completed all practice problems.' },
    ];
    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div><h1 class="page-title">Study Logs</h1><p class="page-subtitle">Track and analyse your daily study sessions</p></div>
    <span class="badge badge-success">Total: 17.5h this week</span>
  </div>
</div>

<div class="grid-2-1 section-gap">
  <!-- Log Form -->
  <div class="card">
    <div class="card-header"><div class="card-title">✍️ Log Today's Session</div><div class="card-subtitle">Feb 28, 2026</div></div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Subject</label>
          <select class="form-select">
            <option>Select subject...</option>
            <option>Data Structures</option><option>DBMS</option><option>OS</option>
            <option>Computer Networks</option><option>AI/ML</option><option>Mathematics</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Hours Studied</label>
          <input type="number" class="form-input" min="0" max="12" step="0.5" placeholder="e.g. 2.5" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Focus Rating</label>
        <div class="star-rating" id="starRating">
          ${[1, 2, 3, 4, 5].map(n => `<span class="star ${n <= 4 ? 'active' : ''}" onclick="setStars(${n})">★</span>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Topics Covered</label>
        <input type="text" class="form-input" placeholder="e.g. Graph BFS/DFS, Heap Sort..." />
      </div>
      <div class="form-group">
        <label class="form-label">Notes & Observations</label>
        <textarea class="form-textarea" placeholder="What did you learn? Any difficulties? Breakthroughs?"></textarea>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary flex-1" onclick="showToast('Session logged successfully!')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/><polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2"/><polyline points="7 3 7 8 15 8" stroke="currentColor" stroke-width="2"/></svg>
          Save Log
        </button>
        <button class="btn btn-outline" onclick="showAILoading()">🤖 AI Analyse</button>
      </div>
    </div>
  </div>

  <!-- Mini Stats -->
  <div style="display:flex;flex-direction:column;gap:16px">
    ${[['📅 Sessions This Week', '12', '↑ +3 vs last week', 'var(--accent)'], ['⏱️ Total Hours', '29.5h', '↑ On target', 'var(--success)'], ['🎯 Avg Focus Score', '4.1 / 5', 'Excellent consistency', 'var(--warning)'], ['📚 Subjects Covered', '5 / 6', 'CN not yet this week', 'var(--danger)']].map(([l, v, m, c]) => `
      <div class="card" style="padding:16px">
        <div style="font-size:12px;font-weight:500;color:var(--text-muted);margin-bottom:4px">${l}</div>
        <div style="font-size:22px;font-weight:800;color:${c}">${v}</div>
        <div style="font-size:12px;color:var(--text-muted)">${m}</div>
      </div>`).join('')}
  </div>
</div>

<!-- Log History -->
<div class="card section-gap">
  <div class="card-header">
    <div class="card-title">📋 Session History</div>
    <input type="text" class="form-input" style="width:200px" placeholder="Search logs..." />
  </div>
  <table class="data-table">
    <thead><tr><th>Date</th><th>Subject</th><th>Hours</th><th>Focus</th><th>Notes</th><th>Action</th></tr></thead>
    <tbody>
      ${logs.map(l => `
        <tr>
          <td style="font-weight:600;white-space:nowrap">${l.date}</td>
          <td><span class="tag">${l.subject}</span></td>
          <td>${l.hours}h</td>
          <td>${'★'.repeat(l.focus)}${'☆'.repeat(5 - l.focus)}</td>
          <td style="font-size:12.5px;color:var(--text-secondary);max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.notes}</td>
          <td><button class="btn btn-ghost btn-sm">Edit</button></td>
        </tr>`).join('')}
    </tbody>
  </table>
</div>`;
}

/* ---- 7. PROFILE ---- */
function renderProfile() {
    const subjects = [
        { name: 'Data Structures', color: '#06B6D4', mark: 82 },
        { name: 'DBMS', color: '#1E3A8A', mark: 65 },
        { name: 'OS', color: '#14B8A6', mark: 74 },
        { name: 'CN', color: '#3B82F6', mark: 75 },
        { name: 'AI/ML', color: '#8B5CF6', mark: 90 },
        { name: 'Mathematics', color: '#F59E0B', mark: 59 },
    ];
    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div><h1 class="page-title">Profile</h1><p class="page-subtitle">Your academic identity & history</p></div>
    <button class="btn btn-outline btn-sm" onclick="showToast('Profile updated!')">Save Changes</button>
  </div>
</div>

<div class="profile-hero section-gap">
  <div class="profile-avatar-lg">RA</div>
  <div style="flex:1">
    <div class="profile-name">Raj Aryan</div>
    <div class="profile-program">B.Tech Computer Science & Engineering · VIT University</div>
    <div class="profile-badges">
      <span class="badge badge-primary">Semester 5</span>
      <span class="badge badge-success">🏆 Top 15%</span>
      <span class="badge badge-accent">28-day streak</span>
      <span class="badge badge-info">CGPA 8.4</span>
    </div>
  </div>
  <button class="btn btn-outline btn-sm">Edit Photo</button>
</div>

<div class="grid-2 section-gap">
  <!-- Personal Info -->
  <div class="card">
    <div class="card-header"><div class="card-title">👤 Personal Information</div></div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="grid-2">
        <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" value="Raj Aryan" /></div>
        <div class="form-group"><label class="form-label">Student ID</label><input class="form-input" value="21BCE1045" /></div>
      </div>
      <div class="grid-2">
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="raj.aryan@vit.ac.in" /></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" value="+91 98765 43210" /></div>
      </div>
      <div class="grid-2">
        <div class="form-group"><label class="form-label">University</label><input class="form-input" value="VIT University" /></div>
        <div class="form-group"><label class="form-label">Current Semester</label><select class="form-select"><option>Semester 5</option><option>Semester 6</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">CGPA</label><input class="form-input" value="8.4" /></div>
    </div>
  </div>

  <!-- Subjects & Attendance -->
  <div class="card">
    <div class="card-header"><div class="card-title">📚 Subjects & Marks</div></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${subjects.map(s => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <span class="subject-chip">
            <span class="chip-dot" style="background:${s.color}"></span>
            ${s.name}
          </span>
          <div style="flex:1"><div class="progress" style="height:6px"><div class="progress-fill" style="width:${s.mark}%;background:${s.color}"></div></div></div>
          <span style="font-size:13px;font-weight:700;min-width:36px;text-align:right">${s.mark}%</span>
        </div>`).join('')}
    </div>
    <div class="divider"></div>
    <div class="form-group">
      <label class="form-label">Attendance (%)</label>
      <div class="flex gap-2 items-center">
        <input type="range" class="range-slider flex-1" min="50" max="100" value="82" oninput="this.nextElementSibling.textContent=this.value+'%'" />
        <span class="badge badge-success" style="min-width:46px;text-align:center">82%</span>
      </div>
    </div>
  </div>
</div>

<!-- Marks Upload -->
<div class="card section-gap">
  <div class="card-header"><div class="card-title">📤 Upload Academic Documents</div><div class="card-subtitle">Internal marks, grade cards, and transcripts</div></div>
  <div class="grid-3">
    ${[['Internal Marks Sheet', 'Upload your teacher\'s internal assessment PDF'], ['Grade Report Card', 'Previous semester grade card (PDF/Image)'], ['Syllabus PDF', 'Your college syllabus for AI-aligned recommendations']].map(([t, d]) => `
      <div class="upload-zone" onclick="showToast('File uploaded!')">
        <div class="upload-icon">📄</div>
        <div class="upload-title">${t}</div>
        <div class="upload-sub">${d}</div>
        <button class="btn btn-outline btn-sm mt-4">Choose File</button>
      </div>`).join('')}
  </div>
</div>`;
}

/* ---- 8. SETTINGS ---- */
function renderSettings() {
    const notifToggles = [
        ['Study Reminders', 'Daily study session reminders at your preferred time', true],
        ['Deadline Alerts', 'Notifications 48h before upcoming assignments', true],
        ['AI Insights', 'Weekly AI-generated performance summaries', true],
        ['Streak Notifications', 'Alerts when your study streak is at risk', false],
        ['Resource Updates', 'New recommended resources for your weak topics', false],
    ];
    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div><h1 class="page-title">Settings</h1><p class="page-subtitle">Personalise your APAIS experience</p></div>
    <button class="btn btn-primary btn-sm" onclick="showToast('Settings saved!')">Save All</button>
  </div>
</div>

<div class="grid-2 section-gap">
  <div>
    <div class="settings-section">
      <div class="settings-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Notifications
      </div>
      ${notifToggles.map(([l, d, on]) => `
        <div class="toggle-group">
          <div class="toggle-label-wrap">
            <div class="toggle-label">${l}</div>
            <div class="toggle-desc">${d}</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${on ? 'checked' : ''} />
            <span class="toggle-slider"></span>
          </label>
        </div>`).join('')}
    </div>

    <div class="settings-section">
      <div class="settings-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Reminder Frequency
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group"><label class="form-label">Morning Reminder Time</label><input type="time" class="form-input" value="07:30" /></div>
        <div class="form-group"><label class="form-label">Evening Reminder Time</label><input type="time" class="form-input" value="19:00" /></div>
        <div class="form-group">
          <label class="form-label">Reminder Frequency</label>
          <select class="form-select"><option>Every Day</option><option>Weekdays Only</option><option>Custom Days</option></select>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div class="settings-section">
      <div class="settings-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Study Preferences
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label class="form-label">Preferred Study Mode</label>
          <select class="form-select"><option>Pomodoro (25+5)</option><option>Deep Work (90 min)</option><option>Flexible</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Peak Focus Time</label>
          <select class="form-select"><option>Early Morning (5-8 AM)</option><option>Morning (8-11 AM)</option><option selected>Afternoon (2-5 PM)</option><option>Evening (7-10 PM)</option><option>Night (10 PM+)</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Daily Study Goal</label>
          <div class="flex gap-2 items-center">
            <input type="range" class="range-slider flex-1" min="1" max="10" value="4" oninput="this.nextElementSibling.textContent=this.value+'h/day'" />
            <span class="badge badge-accent" style="min-width:54px;text-align:center">4h/day</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">AI Suggestion Intensity</label>
          <div class="tabs" style="margin-bottom:0">
            <button class="tab-btn active" onclick="activateTab(this)">Minimal</button>
            <button class="tab-btn" onclick="activateTab(this)">Balanced</button>
            <button class="tab-btn" onclick="activateTab(this)">Aggressive</button>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Appearance
      </div>
      <div class="toggle-group">
        <div class="toggle-label-wrap">
          <div class="toggle-label">Dark Mode</div>
          <div class="toggle-desc">Switch to a dark interface for comfortable night studying</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="darkToggleSettings" onchange="document.getElementById('themeToggle').click()" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="form-group mt-4">
        <label class="form-label">Accent Color</label>
        <div class="flex gap-3">
          ${['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'].map(c => `
            <div onclick="showToast('Accent updated!')" style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;border:2px solid transparent;transition:.2s" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-title">🔗 API Configuration</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${[['Predict Performance', '/api/predict-performance'], ['Generate Study Plan', '/api/generate-study-plan'], ['Get Recommendations', '/api/get-recommendations'], ['Optimize Goal', '/api/optimize-goal'], ['Log Study Session', '/api/log-study-session']].map(([l, v]) => `
          <div class="form-group">
            <label class="form-label">${l}</label>
            <input class="form-input" value="${v}" style="font-family:monospace;font-size:12px" />
          </div>`).join('')}
        <button class="btn btn-accent btn-sm" onclick="showToast('API endpoints saved!')">Save Endpoints</button>
      </div>
    </div>
  </div>
</div>`;
}
