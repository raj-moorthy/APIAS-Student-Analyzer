import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

/* ── Custom Animated Counter Hook ── */
function useCounter(target, duration = 2000, active = false) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!active || hasAnimated.current) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        hasAnimated.current = true;
      }
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return count;
}

/* ── Custom Scroll Reveal/Active Hook ── */
function useScrollActive() {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isActive];
}

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [scholarFeedbacks, setScholarFeedbacks] = useState([
    {
      text: "Implementing the APAIS analytics system has completely overhauled how I schedule my exams. The GPA booster modules pinpoint exactly where my study voids are.",
      name: "Amelia Chen",
      role: "Computer Science Major, Sem 6",
      avatar: "AC",
      rating: 5
    },
    {
      text: "The YouTube dynamic learning interface is outstanding. I typed my physics curriculum and got immediate, highly popular videos that helped me score 95% on my midterms.",
      name: "David Sterling",
      role: "Biochemistry Major, Sem 4",
      avatar: "DS",
      rating: 5
    },
    {
      text: "As an administrator, having a predictive warning engine helps us target students struggling with specific courses early enough to offer beneficial help.",
      name: "Dr. Marcus Vance",
      role: "Dean of Academic Affairs, Stanford L&D",
      avatar: "MV",
      rating: 5
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('apais_scholar_feedback');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScholarFeedbacks(prev => {
            const filtered = prev.filter(f => !parsed.some(p => p.name === f.name));
            return [...parsed, ...filtered];
          });
        }
      } catch (err) {
        console.error("Failed to parse feedbacks from localStorage", err);
      }
    }
  }, []);

  // Stats Section Trigger
  const [statsRef, statsActive] = useScrollActive();

  // Animated counters
  const clientSatisfaction = useCounter(99, 1500, statsActive);
  const gpaImprovement = useCounter(12, 1800, statsActive); // represents 1.2
  const activeStudents = useCounter(25000, 2000, statsActive);
  const processingTime = useCounter(95, 1200, statsActive);

  // Monitor scroll for navbar transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Services data
  const SERVICES = [
    {
      icon: '🧠',
      title: 'Academic Predictive AI',
      desc: 'Harness advanced machine learning algorithms to map grade progression, predict study obstacles, and auto-generate ideal preparation cycles.'
    },
    {
      icon: '☁️',
      title: 'Institutional Cloud',
      desc: 'Deploy resilient, scalable cloud frameworks that unify administration records, student performance profiles, and lesson tracking dynamically.'
    },
    {
      icon: '🛡️',
      title: 'Enterprise Security & Trust',
      desc: 'Protect academic integrity and sensitive student databases with end-to-end encryption, multi-factor authorization, and strict compliance logs.'
    },
    {
      icon: '📊',
      title: 'Advanced Data Pipelines',
      desc: 'Convert unstructured school databases, marks, and attendance logs into highly structured, actionable performance intelligence pipelines.'
    },
    {
      icon: '📱',
      title: 'Custom Education Portals',
      desc: 'Design beautiful learning interfaces, interactive dashboards, and collaboration tools tailored specifically to high-performance learning.'
    },
    {
      icon: '🔍',
      title: 'Strategic Resource Search',
      desc: 'Access curated, peer-verified learning repositories and popular search integrations like our automated top-rated YouTube tutorial system.'
    }
  ];

  // Industries data
  const INDUSTRIES = [
    {
      icon: '🏛️',
      title: 'Higher Education',
      desc: 'Empowering universities to boost student retention rates via actionable early warning alerts.',
      bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: '🚀',
      title: 'EdTech Platforms',
      desc: 'Integrating cognitive prediction and personalized learning models straight into your online courses.',
      bg: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: '🏫',
      title: 'K-12 Institutes',
      desc: 'Guiding younger scholars with structured study tracks, daily planners, and fun motivational checkpoints.',
      bg: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80'
    },
    {
      icon: '💼',
      title: 'Corporate Training',
      desc: 'Accelerating company upskilling programs with deep analytics and clear task execution maps.',
      bg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=80'
    }
  ];

  // Insights / Blog data (Real-time from Dev.to API)
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('https://dev.to/api/articles?tag=ai&top=1&per_page=3');
        if (res.ok) {
          const data = await res.json();
          const mappedArticles = data.map(article => ({
            tag: article.tags ? article.tags.split(',')[0] : 'AI',
            date: new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            title: article.title,
            desc: article.description,
            img: article.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
            link: article.url
          }));
          setInsights(mappedArticles);
        }
      } catch (err) {
        console.error("Failed to fetch real-time blogs", err);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="lp-v3-root">
      {/* ── Background Glow Orbs ── */}
      <div className="lp-glow-orb" style={{ width: '600px', height: '600px', top: '-100px', right: '-100px', background: 'var(--color-cyan)' }} />
      <div className="lp-glow-orb" style={{ width: '500px', height: '500px', top: '40%', left: '-200px', background: 'var(--color-purple)' }} />
      <div className="lp-glow-orb" style={{ width: '700px', height: '700px', bottom: '-200px', right: '-150px', background: 'var(--color-blue)' }} />

      {/* ── STICKY TRANSPARENT NAVIGATION BAR ── */}
      <nav className={`lp-navbar ${scrolled ? 'lp-navbar-scrolled' : ''}`}>
        <a href="#hero" className="lp-nav-logo">
          <div className="lp-nav-logo-icon">A</div>
          <span>APAIS</span>
        </a>
        <ul className="lp-nav-links">
          <li className="lp-nav-link-item"><a href="#services">Services</a></li>
          <li className="lp-nav-link-item"><span onClick={() => navigate('/careers')} style={{ cursor: 'pointer' }}>Careers</span></li>
        </ul>
        <div className="lp-nav-actions">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="lp-btn lp-btn-primary">
              Dashboard <span>→</span>
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="lp-btn-nav-login lp-btn">
                Sign In
              </button>
              <button onClick={() => navigate('/register')} className="lp-btn lp-btn-primary">
                Get Started <span>→</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── SECTION 1: HERO SECTION (Split Layout) ── */}
      <section id="hero" className="lp-hero-sec">
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            <span>Next-Gen Academic Transformation</span>
          </div>
          <h1 className="lp-hero-title">
            Engineering Modern Business &amp; Academic Systems Through <span className="lp-gradient-text">AI &amp; Innovation</span>
          </h1>
          <p className="lp-hero-subtitle">
            Student Analyzer (APAIS) delivers premium, data-driven academic intelligence suites that track performance risks, optimize learning plans, index vital tutorial databases, and support custom cloud integrations.
          </p>
          <div className="lp-hero-actions">
            <a href="#services" className="lp-btn lp-btn-primary">
              Explore Services <span className="lp-hero-btn-arrow">→</span>
            </a>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="lp-btn lp-btn-secondary">
                Go to Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="lp-btn lp-btn-secondary">
                Sign In
              </button>
            )}
          </div>
          <div className="lp-hero-metrics">
            <div className="lp-hero-metric-item">
              <h4>94%</h4>
              <p>Task Completion</p>
            </div>
            <div className="lp-hero-metric-item">
              <h4>+1.2</h4>
              <p>GPA Improvement</p>
            </div>
            <div className="lp-hero-metric-item">
              <h4>Sub-sec</h4>
              <p>Response Time</p>
            </div>
          </div>
        </div>

        {/* Hero Visual: Premium Tech Mockup on Right */}
        <div className="lp-hero-visual">
          <div className="lp-visual-inner">
            <div className="lp-mock-frame lp-glass">
              <div className="lp-mock-header">
                <span className="lp-mock-dot red" />
                <span className="lp-mock-dot yellow" />
                <span className="lp-mock-dot green" />
                <span className="lp-mock-title">APAIS Engine v4.0</span>
              </div>
              <div className="lp-mock-body">
                <div className="lp-mock-grid">
                  <div className="lp-mock-card">
                    <span>Performance Avg</span>
                    <strong>89.4%</strong>
                    <div className="lp-mock-card-trend up">↗ 4.2% up</div>
                  </div>
                  <div className="lp-mock-card">
                    <span>Active Hours</span>
                    <strong>14.5h</strong>
                    <div className="lp-mock-progress">
                      <div className="lp-mock-progress-bar" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="lp-mock-card">
                    <span>Success Risk</span>
                    <strong style={{ color: '#10b981' }}>Optimal</strong>
                    <div className="lp-mock-card-trend up">Stable</div>
                  </div>
                </div>

                {/* Interactive Mock Chart */}
                <div className="lp-mock-chart-container">
                  <div className="lp-mock-chart-title">Weekly Load vs Processing Capacity</div>
                  <div className="lp-mock-chart-bars">
                    {[40, 65, 50, 85, 95, 90, 80].map((h, i) => (
                      <div className="lp-mock-chart-bar-col" key={i}>
                        <div className="lp-mock-chart-bar-fill" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="lp-mock-chart-labels">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => <span key={i}>{l}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Gloss Cards */}
            <div className="lp-floating-badge lp-fb-1 lp-glass">
              <div className="lp-fb-icon">📊</div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Grade Boost</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>+1.2 GPA Increase</div>
              </div>
            </div>
            <div className="lp-floating-badge lp-fb-2 lp-glass">
              <div className="lp-fb-icon">🎯</div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Precision ML</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>99% Accurate Alerting</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: FEATURED SERVICES CARDS ── */}
      <section id="services" className="lp-services-sec">
        <div className="lp-sec-header">
          <span className="lp-sec-eyebrow">Enterprise Capabilities</span>
          <h2 className="lp-sec-title">Our Featured Digital Services</h2>
          <p className="lp-sec-sub">Bridging the gap between raw data analysis and stellar educational outcomes.</p>
        </div>
        <div className="lp-services-grid">
          {SERVICES.map((s, i) => (
            <div className="lp-service-card lp-glass" key={i}>
              <div className="lp-service-icon-wrap">
                {s.icon}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <a href="#innovation" className="lp-service-link">
                Learn More <span>→</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: INDUSTRY SOLUTIONS WITH INTERACTIVE CARDS ── */}
      <section id="industries" className="lp-industry-sec">
        <div className="lp-industry-inner">
          <div className="lp-sec-header">
            <span className="lp-sec-eyebrow">Target Segments</span>
            <h2 className="lp-sec-title">Tailored Industry Solutions</h2>
            <p className="lp-sec-sub">Flexible learning analytics designed for scalable and diverse institutional targets.</p>
          </div>
          <div className="lp-industries-grid">
            {INDUSTRIES.map((ind, i) => (
              <div className="lp-industry-card" key={i}>
                <img src={ind.bg} alt={ind.title} className="lp-industry-bg" />
                <div className="lp-industry-content">
                  <span className="lp-industry-icon">{ind.icon}</span>
                  <h3>{ind.title}</h3>
                  <p>{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: AI INNOVATION SHOWCASE BANNER ── */}
      <section id="innovation">
        <div className="lp-ai-banner lp-glass">
          <div className="lp-ai-banner-content">
            <span className="lp-sec-eyebrow">FUTURISTIC ENGINEERING</span>
            <h2 className="lp-ai-banner-title">Advanced Generative Modeling for Modern Institutes</h2>
            <p className="lp-ai-banner-desc">
              By combining sub-second processing algorithms with cloud microservices, APAIS predicts grade trends, identifies performance bottlenecks, and surfaces crucial search recommendations instantly.
            </p>
            <button onClick={() => navigate('/register')} className="lp-btn lp-btn-primary">
              Unlock AI Analytics <span>→</span>
            </button>
          </div>
          {/* Animated 3D Core Visual */}
          <div className="lp-ai-banner-visual">
            <div className="lp-3d-visual">
              <div className="lp-3d-sphere" />
              <div className="lp-3d-sphere" />
              <div className="lp-3d-sphere" />
              <div className="lp-3d-core" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: STATISTICS WITH ANIMATED COUNTERS ── */}
      <section ref={statsRef} className="lp-stats-sec">
        <div className="lp-stats-inner">
          <div>
            <div className="lp-stat-number">{statsActive ? clientSatisfaction : 0}%</div>
            <div className="lp-stat-label">Client Satisfaction</div>
            <div className="lp-stat-desc">Academic portals validated by top institutions</div>
          </div>
          <div>
            <div className="lp-stat-number">+{statsActive ? (gpaImprovement / 10).toFixed(1) : '0.0'}</div>
            <div className="lp-stat-label">GPA Improvement</div>
            <div className="lp-stat-desc">Average growth recorded within first semester</div>
          </div>
          <div>
            <div className="lp-stat-number">{statsActive ? activeStudents.toLocaleString() : '0'}+</div>
            <div className="lp-stat-label">Active Learners</div>
            <div className="lp-stat-desc">Tracking active goals, schedules and records</div>
          </div>
          <div>
            <div className="lp-stat-number">{statsActive ? processingTime : 0}ms</div>
            <div className="lp-stat-label">API Response Time</div>
            <div className="lp-stat-desc">Ultra-fast recommendation querying latency</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: CLIENT SUCCESS STORIES/TESTIMONIALS ── */}
      <section className="lp-testimonials-sec">
        <div className="lp-sec-header">
          <span className="lp-sec-eyebrow">Client Feedback</span>
          <h2 className="lp-sec-title">What Our Scholars Say</h2>
          <p className="lp-sec-sub">Real testimonies from student cohorts and institution operators utilizing our suite.</p>
        </div>
        <div className="lp-testi-grid">
          {scholarFeedbacks.map((t, i) => (
            <div className="lp-testi-card lp-glass" key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="lp-testi-quote" style={{ margin: 0, lineHeight: 1 }}>“</span>
                <div style={{ color: '#eab308', display: 'flex', gap: '0.1rem', fontSize: '0.9rem' }}>
                  {Array.from({ length: t.rating || 5 }).map((_, sIdx) => (
                    <span key={sIdx}>★</span>
                  ))}
                </div>
              </div>
              <p>{t.text}</p>
              <div className="lp-testi-user">
                <div className="lp-testi-avatar" style={{ background: 'linear-gradient(135deg, var(--color-purple) 0%, var(--color-cyan) 100%)', color: '#fff', fontWeight: '800' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="lp-testi-name">{t.name}</div>
                  <div className="lp-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 7: CAREERS / JOIN-US SECTION ── */}
      <section id="careers" className="lp-careers-sec">
        <div className="lp-careers-visual">
          <div className="lp-careers-box lp-glass">
            <div className="lp-careers-grid-design" />
            <div className="lp-careers-glow" />
            {/* Visual Glass Cards */}
            <div className="lp-careers-visual-card lp-cvc-1 lp-glass">
              <h4 style={{ color: 'var(--color-cyan)' }}>Research Scientist</h4>
              <p>AI Predictive Modeling • Full Time</p>
            </div>
            <div className="lp-careers-visual-card lp-cvc-2 lp-glass">
              <h4 style={{ color: 'var(--color-purple)' }}>Cloud Engineer</h4>
              <p>Serverless Go APIs • Full Time</p>
            </div>
          </div>
        </div>
        <div>
          <span className="lp-sec-eyebrow">GLOBAL TALENT</span>
          <h2 className="lp-sec-title">Build the Future of Cognitive Education</h2>
          <p className="lp-hero-subtitle" style={{ fontSize: '1.05rem' }}>
            We are always seeking passionate engineers, data scientists, and creative designers to push the boundaries of predictive analytics and personalized EdTech.
          </p>
          <button onClick={() => navigate('/careers')} className="lp-btn lp-btn-primary">
            Explore Open Careers <span>→</span>
          </button>
        </div>
      </section>

      {/* ── SECTION 8: LATEST INSIGHTS / BLOG CARDS ── */}
      <section id="insights">
        <div className="lp-sec-header">
          <span className="lp-sec-eyebrow">Knowledge Center</span>
          <h2 className="lp-sec-title">Latest Academic Insights</h2>
          <p className="lp-sec-sub">Exploring the nexus between educational technology, cognitive engineering, and cloud frameworks.</p>
        </div>
        <div className="lp-blog-grid">
          {insights.map((insight, i) => (
            <div className="lp-blog-card lp-glass" key={i} style={{ animation: `float ${3 + i}s ease-in-out infinite alternate` }}>
              <div className="lp-blog-img-wrap">
                <img src={insight.img} alt={insight.title} className="lp-blog-img" />
                <span className="lp-blog-tag">{insight.tag}</span>
              </div>
              <div className="lp-blog-content">
                <div className="lp-blog-meta">{insight.date}</div>
                <h3>{insight.title}</h3>
                <p className="lp-blog-desc">{insight.desc}</p>
                <a href={insight.link} target="_blank" rel="noopener noreferrer" className="lp-blog-link">
                  Read Article <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 9: GLOBAL FOOTER (Multi-column) ── */}
      <footer className="lp-footer-sec">
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <a href="#hero" className="lp-nav-logo">
                <div className="lp-nav-logo-icon">A</div>
                <span>APAIS</span>
              </a>
              <p>Engineering future-proof, cognitive academic suites for institutions, learners, and learning developers.</p>
              <div className="lp-footer-socials">
                {['TW', 'LN', 'GH', 'YT'].map((s, i) => (
                  <a href="#hero" className="lp-footer-social-link" key={i}>{s}</a>
                ))}
              </div>
            </div>

            <div className="lp-footer-col">
              <h4>Capabilities</h4>
              <ul>
                <li><a href="#services">Academic AI Engine</a></li>
                <li><a href="#services">Cloud Integrations</a></li>
                <li><a href="#services">Institution Platforms</a></li>
                <li><a href="#services">Dynamic Search</a></li>
              </ul>
            </div>

            <div className="lp-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#hero">About APAIS</a></li>
                <li><a href="#careers">Careers Hub</a></li>
                <li><a href="#insights">Insights &amp; Blogs</a></li>
                <li><a href="#hero">Partner Network</a></li>
              </ul>
            </div>

            <div className="lp-footer-newsletter">
              <h4>Subscribe to Insights</h4>
              <p>Stay up to date with early warning models, EdTech cloud solutions, and student intelligence research.</p>
              <form className="lp-footer-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your business email" className="lp-footer-input" />
                <button type="submit" className="lp-btn lp-btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div>© 2026 APAIS Academic Intelligence Suite. All rights reserved.</div>
            <div className="lp-footer-bottom-links">
              <a href="#hero">Privacy Policy</a>
              <a href="#hero">Terms of Service</a>
              <a href="#hero">Security Architecture</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
