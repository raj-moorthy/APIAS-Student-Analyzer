/* =========================================
   APAIS – Charts & Visualizations (Chart.js)
   ========================================= */

const CHART_DEFAULTS = {
  font: { family: 'Inter, sans-serif', size: 12 },
  color: '#94A3B8',
};

Chart.defaults.font.family = CHART_DEFAULTS.font.family;
Chart.defaults.color = CHART_DEFAULTS.color;

const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

/* Gradient helper */
function makeGradient(ctx, color1, color2, vertical = true) {
  const g = vertical
    ? ctx.createLinearGradient(0, 0, 0, 300)
    : ctx.createLinearGradient(0, 0, 300, 0);
  g.addColorStop(0, color1);
  g.addColorStop(1, color2);
  return g;
}

/* ---- Performance Trend Line Chart ---- */
function initTrendChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const c = ctx.getContext('2d');
  const grad = makeGradient(c, 'rgba(6,182,212,0.25)', 'rgba(6,182,212,0)');
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      datasets: [{
        label: 'Overall Score',
        data: [68, 72, 69, 75, 78, 82, 85],
        borderColor: '#06B6D4',
        backgroundColor: grad,
        borderWidth: 2.5,
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }, {
        label: 'Predicted',
        data: [null, null, null, null, null, 82, 87, 91],
        borderColor: '#14B8A6',
        borderWidth: 2,
        borderDash: [5, 4],
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#14B8A6',
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 12, padding: 14 } }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { min: 55, max: 100, grid: { color: 'rgba(148,163,184,0.1)' }, border: { display: false }, ticks: { callback: v => v + '%' } }
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
    }
  });
}

/* ---- Subject Radar Chart ---- */
function initRadarChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['DS', 'DBMS', 'OS', 'CN', 'AI/ML', 'Math'],
      datasets: [{
        label: 'Your Score',
        data: [82, 68, 74, 78, 90, 65],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6,182,212,0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#06B6D4',
        pointRadius: 4,
      }, {
        label: 'Class Avg',
        data: [70, 72, 68, 65, 74, 70],
        borderColor: 'rgba(148,163,184,0.5)',
        backgroundColor: 'rgba(148,163,184,0.07)',
        borderWidth: 1.5,
        pointBackgroundColor: '#94A3B8',
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 12 } } },
      scales: {
        r: {
          min: 40, max: 100,
          ticks: { stepSize: 20, backdropColor: 'transparent' },
          grid: { color: 'rgba(148,163,184,0.15)' },
          pointLabels: { font: { size: 12, weight: '600' } },
        }
      }
    }
  });
}

/* ---- Study Time Pie Chart ---- */
function initPieChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['DS', 'DBMS', 'OS', 'CN', 'AI/ML', 'Math'],
      datasets: [{
        data: [22, 18, 15, 12, 24, 9],
        backgroundColor: ['#06B6D4','#1E3A8A','#14B8A6','#3B82F6','#8B5CF6','#F59E0B'],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, padding: 14, font: { size: 12 } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
      }
    }
  });
}

/* ---- Improvement Bar Chart ---- */
function initImprovementChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const c = ctx.getContext('2d');
  const grad = makeGradient(c, '#1E3A8A', '#06B6D4');
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
      datasets: [{
        label: 'Marks (%)',
        data: [65, 70, 68, 76, 80, 85],
        backgroundColor: grad,
        borderRadius: 7,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { min: 50, max: 100, grid: { color: 'rgba(148,163,184,0.1)' }, border: { display: false }, ticks: { callback: v => v + '%' } }
      }
    }
  });
}

/* ---- Risk Bar Chart ---- */
function initRiskChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['DS', 'DBMS', 'OS', 'CN', 'AI/ML', 'Math'],
      datasets: [{
        label: 'Risk Level (%)',
        data: [20, 55, 38, 42, 15, 68],
        backgroundColor: [
          'rgba(16,185,129,0.75)','rgba(239,68,68,0.75)','rgba(245,158,11,0.75)',
          'rgba(245,158,11,0.75)','rgba(16,185,129,0.75)','rgba(239,68,68,0.75)'
        ],
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { min: 0, max: 100, grid: { color: 'rgba(148,163,184,0.1)' }, border: { display: false }, ticks: { callback: v => v + '%' } },
        y: { grid: { display: false }, border: { display: false } }
      }
    }
  });
}

/* ---- Weekly Hours Line ---- */
function initWeeklyHoursChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const c = ctx.getContext('2d');
  const grad = makeGradient(c, 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0)');
  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        label: 'Hours Studied',
        data: [3.5, 4, 2.5, 5, 3, 6, 4.5],
        borderColor: '#8B5CF6',
        backgroundColor: grad,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { min: 0, max: 8, grid: { color: 'rgba(148,163,184,0.1)' }, border: { display: false } }
      }
    }
  });
}
