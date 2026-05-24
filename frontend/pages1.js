/* =========================================
   APAIS – Page Renderers (Pages 1-4)
   ========================================= */

/* ---- 1. DASHBOARD ---- */
function renderDashboard() {
    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">AI-powered academic overview · Semester 5</p>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-outline btn-sm" onclick="showAILoading()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Refresh AI
      </button>
      <button class="btn btn-accent btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Export Report
      </button>
    </div>
  </div>
</div>

<div class="dashboard-hero">
  <div class="hero-greeting">Good evening, Raj 👋</div>
  <div class="hero-title">Your Academic Intelligence Summary</div>
  <div class="hero-subtitle">Based on 6 months of learning patterns · Last updated 2 hours ago</div>
  <div class="hero-stats">
    <div class="hero-stat">
      <span class="hero-stat-value">87%</span>
      <span class="hero-stat-label">Predicted Final Score</span>
    </div>
    <div class="hero-stat">
      <span class="hero-stat-value">28</span>
      <span class="hero-stat-label">Day Streak 🔥</span>
    </div>
    <div class="hero-stat">
      <span class="hero-stat-value">4.2h</span>
      <span class="hero-stat-label">Avg Daily Study</span>
    </div>
    <div class="hero-stat">
      <span class="hero-stat-value">3</span>
      <span class="hero-stat-label">Deadlines This Week</span>
    </div>
  </div>
</div>

<!-- Stat Cards -->
<div class="grid-4 section-gap">
  <div class="stat-card" style="--card-accent: linear-gradient(90deg,#06B6D4,#14B8A6)">
    <div class="stat-icon" style="background:rgba(6,182,212,0.1);color:#06B6D4">📊</div>
    <div class="stat-label">PREDICTED FINAL SCORE</div>
    <div class="stat-value">87<span style="font-size:18px;font-weight:600">%</span></div>
    <div class="stat-delta up">▲ +5.2% from last month</div>
    <div class="confidence-bar mt-2"><div class="confidence-fill" style="width:87%"></div></div>
    <div class="stat-meta">Confidence: 91.4%</div>
  </div>

  <div class="stat-card" style="--card-accent: linear-gradient(90deg,#F59E0B,#EF4444)">
    <div class="stat-icon" style="background:rgba(245,158,11,0.1);color:#F59E0B">⚠️</div>
    <div class="stat-label">ACADEMIC RISK INDEX</div>
    <div class="stat-value" style="color:#F59E0B">23<span style="font-size:18px;font-weight:600">%</span></div>
    <div class="stat-delta down">Math & DBMS flagged</div>
    <div class="risk-indicator mt-2"><div class="risk-bar"><div class="risk-fill" style="width:23%"></div></div><span style="font-size:11px;color:var(--warning)">Low</span></div>
    <div class="stat-meta">2 subjects need attention</div>
  </div>

  <div class="stat-card" style="--card-accent: linear-gradient(90deg,#10B981,#06B6D4)">
    <div class="stat-icon" style="background:rgba(16,185,129,0.1);color:#10B981">🔥</div>
    <div class="stat-label">STUDY STREAK</div>
    <div class="stat-value">28<span style="font-size:18px;font-weight:600">d</span></div>
    <div class="stat-delta up">▲ Personal best!</div>
    <div class="confidence-bar mt-2"><div class="confidence-fill" style="width:93%;background:var(--success)"></div></div>
    <div class="stat-meta">Target: 30 days</div>
  </div>

  <div class="stat-card" style="--card-accent: linear-gradient(90deg,#8B5CF6,#3B82F6)">
    <div class="stat-icon" style="background:rgba(139,92,246,0.1);color:#8B5CF6">⏱️</div>
    <div class="stat-label">WEEKLY STUDY HOURS</div>
    <div class="stat-value">29<span style="font-size:18px;font-weight:600">h</span></div>
    <div class="stat-delta up">▲ +3h from last week</div>
    <div class="confidence-bar mt-2"><div class="confidence-fill" style="width:72%;background:linear-gradient(90deg,#8B5CF6,#3B82F6)"></div></div>
    <div class="stat-meta">Target: 35 hrs/week</div>
  </div>
</div>

<!-- Charts Row 1 -->
<div class="grid-2-1 section-gap">
  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Performance Trend</div><div class="card-subtitle">Score progression over 7 months</div></div>
      <span class="badge badge-success">+17% growth</span>
    </div>
    <div class="chart-container" style="height:220px"><canvas id="trendChart"></canvas></div>
  </div>
  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Study Time Distribution</div><div class="card-subtitle">Hours per subject this month</div></div>
    </div>
    <div class="chart-container" style="height:220px"><canvas id="pieChart"></canvas></div>
  </div>
</div>

<!-- Charts Row 2 -->
<div class="grid-2-1 section-gap">
  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Weekly Study Hours</div><div class="card-subtitle">Daily breakdown this week</div></div>
      <span class="badge badge-accent">29h total</span>
    </div>
    <div class="chart-container" style="height:200px"><canvas id="weeklyChart"></canvas></div>
  </div>
  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Subject Strength</div><div class="card-subtitle">vs class average</div></div>
    </div>
    <div class="chart-container" style="height:200px"><canvas id="radarChart"></canvas></div>
  </div>
</div>

<!-- Upcoming Deadlines -->
<div class="card section-gap">
  <div class="card-header">
    <div class="card-title">📅 Upcoming Deadlines</div>
    <button class="btn btn-ghost btn-sm">View all</button>
  </div>
  <table class="data-table">
    <thead><tr><th>Subject</th><th>Assignment</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>
      <tr><td><span class="badge badge-info">DS</span></td><td>Graph Algorithms Assignment</td><td>Mar 5, 2026</td><td><span class="badge badge-warning">Due Soon</span></td><td><button class="btn btn-outline btn-sm">Open</button></td></tr>
      <tr><td><span class="badge badge-danger">Math</span></td><td>Chapter 7 Problem Set</td><td>Mar 7, 2026</td><td><span class="badge badge-danger">Urgent</span></td><td><button class="btn btn-outline btn-sm">Open</button></td></tr>
      <tr><td><span class="badge badge-success">AI/ML</span></td><td>Mini Project Milestone 2</td><td>Mar 12, 2026</td><td><span class="badge badge-success">On Track</span></td><td><button class="btn btn-outline btn-sm">Open</button></td></tr>
    </tbody>
  </table>
</div>`;
}

/* ---- 2. STUDY PLANNER ---- */
function renderPlanner() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dates = [25, 26, 27, 28, 1, 2, 3];
    const tasks = [
        { subj: 'DS', title: 'Graph BFS/DFS Practice', time: '8:00 AM', done: true, color: '#06B6D4' },
        { subj: 'DBMS', title: 'Normalization — NF1/NF2/NF3', time: '10:00 AM', done: false, color: '#1E3A8A' },
        { subj: 'OS', title: 'Process Scheduling Theory', time: '2:00 PM', done: false, color: '#14B8A6' },
        { subj: 'Math', title: 'Integration by Parts Exercises', time: '5:00 PM', done: false, color: '#F59E0B' },
        { subj: 'CN', title: 'TCP/IP Model Revision', time: '7:30 PM', done: true, color: '#8B5CF6' },
    ];
    const aiPlan = [
        'Start with DS Graph Algorithms before 9 AM — your focus peaks in the morning.',
        'Schedule DBMS revision after DS — related content improves retention by 34%.',
        'Take a 20-minute break at 12 PM to maintain throughput during afternoon sessions.',
        'Math requires 90-minute deep focus; avoid interruptions during that block.',
    ];

    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div><h1 class="page-title">Study Planner</h1><p class="page-subtitle">AI-optimized schedule for maximum retention</p></div>
    <div class="flex gap-2">
      <button class="btn btn-outline btn-sm" onclick="showAILoading()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Regenerate Plan
      </button>
      <button class="btn btn-accent btn-sm" onclick="showAILoading()">⚡ Optimize Schedule</button>
    </div>
  </div>
</div>

<!-- Week Calendar -->
<div class="card section-gap">
  <div class="card-header">
    <div class="card-title">Week of Feb 25 – Mar 3, 2026</div>
    <div class="flex gap-2">
      <button class="btn btn-ghost btn-sm">‹ Prev</button>
      <button class="btn btn-ghost btn-sm">Next ›</button>
    </div>
  </div>
  <div class="week-calendar">
    ${days.map((d, i) => `
      <div class="day-cell ${i === 3 ? 'today' : ''} ${[0, 1, 3, 4].includes(i) ? 'has-tasks' : ''}">
        <div class="day-name">${d}</div>
        <div class="day-num">${dates[i]}</div>
      </div>`).join('')}
  </div>
</div>

<div class="grid-2 section-gap">
  <!-- Tasks -->
  <div class="card">
    <div class="card-header">
      <div><div class="card-title">📋 Today's Tasks — Feb 28</div><div class="card-subtitle">${tasks.filter(t => t.done).length} of ${tasks.length} completed</div></div>
      <button class="btn btn-outline btn-sm" onclick="showToast('Task added!')">+ Add Task</button>
    </div>
    <div class="task-list">
      ${tasks.map(t => `
        <div class="task-item ${t.done ? 'done' : ''}" onclick="this.classList.toggle('done');this.querySelector('.task-check').classList.toggle('checked')">
          <div class="task-check ${t.done ? 'checked' : ''}"></div>
          <span class="task-subject-dot" style="background:${t.color}; width:8px;height:8px;border-radius:50%;flex-shrink:0"></span>
          <span class="task-title">${t.title}</span>
          <span class="task-meta" style="flex-shrink:0">${t.subj} · ${t.time}</span>
        </div>`).join('')}
    </div>
    <div class="divider"></div>
    <div class="progress"><div class="progress-fill accent" style="width:40%"></div></div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:6px">40% complete · ~3.5h remaining</div>
  </div>

  <!-- Subject Allocation -->
  <div class="card">
    <div class="card-header"><div class="card-title">⏳ Subject Time Allocation</div><div class="card-subtitle">This week's focus distribution</div></div>
    <div class="time-alloc-bar">
      ${[['Data Structures', '6h', '#06B6D4', 85], ['AI/ML', '5h', '#8B5CF6', 72], ['DBMS', '4h', '#1E3A8A', 55], ['OS', '3.5h', '#14B8A6', 50], ['Mathematics', '4h', '#F59E0B', 57], ['CN', '2.5h', '#3B82F6', 35]].map(([s, h, c, p]) => `
        <div class="alloc-item">
          <div class="alloc-subject"><span>${s}</span><span style="color:var(--text-muted)">${h}</span></div>
          <div class="progress"><div class="progress-fill" style="width:${p}%;background:${c}"></div></div>
        </div>`).join('')}
    </div>
  </div>
</div>

<!-- AI Plan -->
<div class="ai-plan-card section-gap">
  <div class="ai-plan-header">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#ag)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="ag" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#06B6D4"/><stop offset="1" stop-color="#14B8A6"/></linearGradient></defs></svg>
    <div class="card-title">AI Study Plan — Today's Recommendations</div>
    <span class="ai-badge">APAIS AI</span>
  </div>
  ${aiPlan.map(p => `<div class="ai-plan-item"><div class="ai-dot"></div><div class="ai-plan-text">${p}</div></div>`).join('')}
</div>`;
}

/* ---- 3. PERFORMANCE ANALYTICS ---- */
function renderAnalytics() {
    const marks = [
        { sub: 'Data Structures', t1: 75, t2: 80, t3: 85, avg: 80, trend: '▲', risk: 'Low' },
        { sub: 'DBMS', t1: 60, t2: 65, t3: 70, avg: 65, trend: '▲', risk: 'High' },
        { sub: 'Operating Systems', t1: 70, t2: 68, t3: 74, avg: 71, trend: '→', risk: 'Medium' },
        { sub: 'Computer Networks', t1: 72, t2: 76, t3: 78, avg: 75, trend: '▲', risk: 'Medium' },
        { sub: 'AI/ML', t1: 82, t2: 88, t3: 92, avg: 87, trend: '▲', risk: 'Low' },
        { sub: 'Mathematics', t1: 55, t2: 60, t3: 62, avg: 59, trend: '▲', risk: 'High' },
    ];
    const heatData = Array.from({ length: 7 * 8 }, () => Math.floor(Math.random() * 5));

    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div><h1 class="page-title">Performance Analytics</h1><p class="page-subtitle">In-depth academic performance breakdown</p></div>
    <div class="flex gap-2">
      <select class="form-select" style="width:auto;padding:7px 12px;">
        <option>All Semesters</option><option selected>Semester 5</option><option>Semester 4</option>
      </select>
      <button class="btn btn-accent btn-sm">📊 Full Report</button>
    </div>
  </div>
</div>

<!-- Charts Row -->
<div class="grid-2 section-gap">
  <div class="card">
    <div class="card-header"><div class="card-title">Score Improvement</div><div class="card-subtitle">Test-wise marks progression</div></div>
    <div class="chart-container" style="height:220px"><canvas id="improvementChart"></canvas></div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Subject Risk Levels</div><div class="card-subtitle">Probability of failing threshold</div></div>
    <div class="chart-container" style="height:220px"><canvas id="riskChart"></canvas></div>
  </div>
</div>

<!-- Marks Table -->
<div class="card section-gap">
  <div class="card-header">
    <div class="card-title">📝 Marks History</div>
    <div class="flex gap-2">
      <input type="text" class="form-input" style="width:180px" placeholder="Search subject..." />
      <button class="btn btn-outline btn-sm">Filter</button>
    </div>
  </div>
  <table class="data-table">
    <thead><tr><th>Subject</th><th>Test 1</th><th>Test 2</th><th>Test 3</th><th>Average</th><th>Trend</th><th>Risk</th></tr></thead>
    <tbody>
      ${marks.map(m => `
        <tr>
          <td style="font-weight:600">${m.sub}</td>
          <td>${m.t1}%</td><td>${m.t2}%</td><td>${m.t3}%</td>
          <td><strong>${m.avg}%</strong></td>
          <td style="color:${m.trend === '▲' ? 'var(--success)' : m.trend === '▼' ? 'var(--danger)' : 'var(--text-muted)'}">${m.trend}</td>
          <td><span class="badge ${m.risk === 'Low' ? 'badge-success' : m.risk === 'High' ? 'badge-danger' : 'badge-warning'}">${m.risk}</span></td>
        </tr>`).join('')}
    </tbody>
  </table>
</div>

<!-- Heatmap -->
<div class="card section-gap">
  <div class="card-header">
    <div><div class="card-title">Weak Topic Heatmap</div><div class="card-subtitle">Study activity intensity over 8 weeks</div></div>
    <div class="flex gap-2 items-center" style="font-size:12px;color:var(--text-muted)">
      Less <div style="display:flex;gap:3px;margin:0 6px">${[0, 1, 2, 3, 4].map(l => `<div style="width:12px;height:12px;border-radius:3px;background:rgba(6,182,212,${l ? l * 0.2 : 0.06})"></div>`).join('')}</div> More
    </div>
  </div>
  <div style="display:flex;gap:6px;align-items:flex-start">
    <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--text-muted);padding-top:2px">
      ${['DS', 'DB', 'OS', 'CN', 'ML', 'MA', 'PH', 'PY'].map(s => `<div style="height:28px;display:flex;align-items:center">${s}</div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;flex:1">
      ${heatData.map(v => `<div class="heatmap-cell heat-${v}" style="height:28px" data-tooltip="Activity: ${v}/4"></div>`).join('')}
    </div>
  </div>
  <div style="display:flex;gap:8px;margin-top:10px;font-size:11.5px;color:var(--text-muted)">
    ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div style="flex:1;text-align:center">${d}</div>`).join('')}
  </div>
</div>`;
}

/* ---- 4. RESOURCES ---- */
function renderResources() {
    const resources = [
        { title: 'Graph Algorithms Masterclass', sub: 'Data Structures', type: 'Video', diff: 3, color: '#06B6D4', summary: 'Covers BFS, DFS, Dijkstra, and Bellman-Ford with animated visualizations — ideal for your upcoming test.', tag: 'badge-info' },
        { title: 'DBMS Normalization Cheatsheet', sub: 'Database Management', type: 'Notes', diff: 2, color: '#1E3A8A', summary: 'Concise reference for 1NF through BCNF with examples. Directly addresses your weakest DBMS topic.', tag: 'badge-primary' },
        { title: 'Mathematics: Integration Techniques', sub: 'Engineering Mathematics', type: 'Book', diff: 4, color: '#F59E0B', summary: 'Chapter 5 is focused on integration by parts — your lowest-scoring area based on recent tests.', tag: 'badge-warning' },
        { title: 'OS Process Scheduling Deep Dive', sub: 'Operating Systems', type: 'Notes', diff: 2, color: '#14B8A6', summary: 'Comprehensive notes on FCFS, SJF, Round Robin with practice problems and time diagrams.', tag: 'badge-success' },
        { title: 'ML From Scratch — Andrew Ng', sub: 'Artificial Intelligence', type: 'Video', diff: 3, color: '#8B5CF6', summary: 'Highly rated course aligned with your syllabus. Your AI/ML performance already strong — deepen it.', tag: 'badge-accent' },
        { title: 'Computer Networks: Protocols', sub: 'Computer Networks', type: 'Book', diff: 3, color: '#3B82F6', summary: 'Authoritative reference covering TCP/IP, HTTP, DNS, and routing algorithms with exam questions.', tag: 'badge-info' },
    ];

    return `
<div class="page-header">
  <div class="flex items-center justify-between">
    <div><h1 class="page-title">Resource Recommendations</h1><p class="page-subtitle">AI-curated study materials based on your weak areas</p></div>
    <span class="badge badge-accent">12 new resources</span>
  </div>
</div>

<div class="search-bar-large">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  <input type="text" placeholder="Search by topic, subject, or keyword..." oninput="filterResources(this.value)" />
</div>

<div class="flex gap-2 mb-4" style="flex-wrap:wrap">
  ${['All', 'Video', 'Notes', 'Book', 'Easy', 'Medium', 'Hard'].map((f, i) => `
    <button class="btn btn-outline btn-sm filter-btn ${i === 0 ? 'active-filter' : ''}" onclick="setFilter(this,'${f}')">${f}</button>`).join('')}
</div>

<div class="grid-3 section-gap" id="resourceGrid">
  ${resources.map(r => `
    <div class="resource-card" style="--rc-color:${r.color}">
      <div class="resource-type" style="color:${r.color}">${r.type}</div>
      <div class="resource-title">${r.title}</div>
      <div class="resource-subject">${r.sub}</div>
      <div class="flex gap-2 items-center">
        <span class="badge ${r.tag}">${r.type}</span>
        <div class="difficulty-dots">
          ${[1, 2, 3, 4, 5].map(n => `<div class="diff-dot ${n <= r.diff ? 'filled' : ''}"></div>`).join('')}
        </div>
        <span style="font-size:11.5px;color:var(--text-muted)">Difficulty</span>
      </div>
      <div class="resource-ai-summary">🤖 ${r.summary}</div>
      <div class="resource-footer">
        <button class="btn btn-outline btn-sm">Open Resource</button>
        <button class="btn btn-accent btn-sm" onclick="showToast('Resource saved!')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Save
        </button>
      </div>
    </div>`).join('')}
</div>`;
}
