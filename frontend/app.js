/* =========================================
   APAIS – Main App Controller
   app.js – Router, Theme, Interactions
   ========================================= */

'use strict';

// ---- State ----
const state = {
    currentPage: 'dashboard',
    theme: localStorage.getItem('apais-theme') || 'light',
};

// ---- Page Map ----
const pages = {
    dashboard: { label: 'Dashboard', render: renderDashboard, afterRender: initDashboardCharts },
    planner: { label: 'Study Planner', render: renderPlanner, afterRender: null },
    analytics: { label: 'Performance Analytics', render: renderAnalytics, afterRender: initAnalyticsCharts },
    resources: { label: 'Resources', render: renderResources, afterRender: null },
    goals: { label: 'Goal Optimization', render: renderGoals, afterRender: null },
    logs: { label: 'Study Logs', render: renderLogs, afterRender: null },
    profile: { label: 'Profile', render: renderProfile, afterRender: null },
    settings: { label: 'Settings', render: renderSettings, afterRender: null },
};

// ---- Router ----
function navigate(pageId) {
    if (!pages[pageId]) return;
    state.currentPage = pageId;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === pageId);
    });

    // Update breadcrumb
    const bc = document.getElementById('breadcrumbCurrent');
    if (bc) bc.textContent = pages[pageId].label;

    // Render page
    const content = document.getElementById('pageContent');
    content.style.opacity = '0';
    content.style.transform = 'translateY(10px)';
    content.innerHTML = pages[pageId].render();
    requestAnimationFrame(() => {
        content.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
    });

    // After render hook (charts etc.)
    if (pages[pageId].afterRender) {
        setTimeout(pages[pageId].afterRender, 80);
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
    }

    // Update URL hash
    history.replaceState(null, '', `#${pageId}`);
}

// ---- Chart Init Hooks ----
function initDashboardCharts() {
    initTrendChart('trendChart');
    initPieChart('pieChart');
    initRadarChart('radarChart');
    initWeeklyHoursChart('weeklyChart');
}
function initAnalyticsCharts() {
    initImprovementChart('improvementChart');
    initRiskChart('riskChart');
}

// ---- Theme ----
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('apais-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        icon.innerHTML = '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
    } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    // Sync settings dark toggle if visible
    const settingToggle = document.getElementById('darkToggleSettings');
    if (settingToggle) settingToggle.checked = theme === 'dark';
    // Redraw charts for new colors
    setTimeout(() => {
        if (state.currentPage === 'dashboard') initDashboardCharts();
        if (state.currentPage === 'analytics') initAnalyticsCharts();
    }, 50);
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
}

// ---- Toast Notification ----
function showToast(msg, type = 'success') {
    let toast = document.getElementById('apaisToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'apaisToast';
        Object.assign(toast.style, {
            position: 'fixed', bottom: '28px', right: '28px',
            padding: '12px 20px', borderRadius: '10px',
            fontSize: '13.5px', fontWeight: '500',
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            display: 'flex', alignItems: 'center', gap: '8px',
            zIndex: '9999', transition: 'all 0.28s ease',
            transform: 'translateY(20px)', opacity: '0',
            fontFamily: 'Inter,sans-serif',
        });
        document.body.appendChild(toast);
    }
    const colors = { success: ['#10B981', '#ecfdf5'], error: ['#EF4444', '#fef2f2'], info: ['#3B82F6', '#eff6ff'] };
    const [fg, bg] = colors[type] || colors.success;
    toast.style.background = bg;
    toast.style.color = fg;
    toast.style.border = `1px solid ${fg}30`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span style="font-size:16px;font-weight:700">${icons[type] || '✓'}</span> ${msg}`;
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
    }, 3200);
}

// ---- AI Loading Simulation ----
function showAILoading(ms = 1800) {
    const el = document.getElementById('aiLoading');
    el.classList.add('visible');
    setTimeout(() => {
        el.classList.remove('visible');
        showToast('AI analysis complete!');
    }, ms);
}

// ---- Star Rating ----
function setStars(n) {
    document.querySelectorAll('#starRating .star').forEach((s, i) => {
        s.classList.toggle('active', i < n);
    });
}

// ---- Resource Filter ----
function filterResources(q) {
    const cards = document.querySelectorAll('.resource-card');
    q = q.toLowerCase();
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
    });
}

function setFilter(btn, filter) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
    btn.classList.add('active-filter');
    // Basic type/difficulty filter
    const cards = document.querySelectorAll('.resource-card');
    cards.forEach(card => {
        if (['All'].includes(filter)) { card.style.display = ''; return; }
        card.style.display = card.innerText.includes(filter) ? '' : 'none';
    });
}

// ---- Tab activation ----
function activateTab(btn) {
    const group = btn.closest('.tabs');
    if (!group) return;
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ---- Sidebar Toggle ----
function setupSidebarToggle() {
    const btn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
            sidebar.classList.toggle('open');
        } else {
            const collapsed = sidebar.style.width === '64px';
            sidebar.style.width = collapsed ? 'var(--sidebar-width)' : '64px';
            sidebar.style.overflow = collapsed ? 'hidden' : 'hidden';
            document.querySelectorAll('.nav-label,.nav-badge,.brand-text,.nav-section-label,.user-info,.user-status-dot').forEach(el => {
                el.style.display = collapsed ? '' : 'none';
            });
        }
    });
}

// ---- Filter button styles ----
function injectFilterStyle() {
    const style = document.createElement('style');
    style.textContent = `
    .active-filter { background: var(--gradient-accent)!important; color:#fff!important; border-color:transparent!important; }
    .filter-btn { transition: all 0.15s ease; }
  `;
    document.head.appendChild(style);
}

// ---- Hash Routing ----
function handleHashRoute() {
    const hash = location.hash.replace('#', '');
    if (pages[hash]) navigate(hash);
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    applyTheme(state.theme);

    // Wire nav items
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            navigate(el.dataset.page);
        });
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Sidebar toggle
    setupSidebarToggle();

    // Notification button
    document.getElementById('notifBtn')?.addEventListener('click', () => showToast('No new notifications', 'info'));

    // Search shortcut
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearch')?.focus();
        }
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', e => {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 900 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target.id !== 'sidebarToggle') {
                sidebar.classList.remove('open');
            }
        }
    });

    injectFilterStyle();

    // Initial page
    handleHashRoute() || navigate('dashboard');

    // Animate stat card confidence bars on load
    setTimeout(() => {
        document.querySelectorAll('.confidence-fill').forEach(el => {
            const w = el.style.width;
            el.style.width = '0';
            requestAnimationFrame(() => { el.style.width = w; });
        });
    }, 200);
});

window.addEventListener('hashchange', handleHashRoute);
