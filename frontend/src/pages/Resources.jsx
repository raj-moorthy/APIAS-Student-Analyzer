import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'History', 'Economics', 'Geography',
  'Data Science', 'Machine Learning', 'Web Development',
  'Mechanical Engineering', 'Electrical Engineering',
];

const DOMAIN_OPTIONS = [
  'Tutorial', 'Full Course Lecture', 'Crash Course',
  'Problem Solving', 'Exam Preparation', 'Lab / Practical',
];

// ─── Curated Blog Articles Pool ──────────────────────────────────────────────
const BLOG_ARTICLES_POOL = [
  // General Study Skills & Productivity
  {
    id: 'b1',
    title: 'How to Build a Study Schedule That Actually Works',
    author: 'Ali Abdaal',
    source: 'aliabdaal.com',
    url: 'https://aliabdaal.com/how-to-study/',
    description: 'Evidence-backed strategies for creating a sustainable, effective study schedule based on spaced repetition and active recall.',
    category: 'Study Skills',
    readTime: '7 min read',
    emoji: '📅',
    subjects: ['all'],
    levels: ['beginner', 'intermediate']
  },
  {
    id: 'b2',
    title: 'The Feynman Technique: The Best Way to Learn Anything',
    author: 'James Clear',
    source: 'fs.blog',
    url: 'https://fs.blog/feynman-technique/',
    description: 'Nobel Prize-winning physicist Richard Feynman\'s method for understanding complex concepts by simplifying them to basics.',
    category: 'Learning Methods',
    readTime: '6 min read',
    emoji: '🧠',
    subjects: ['all'],
    levels: ['beginner', 'intermediate', 'advanced']
  },
  {
    id: 'b3',
    title: 'Study Tips for Exam Season',
    author: 'Khan Academy',
    source: 'blog.khanacademy.org',
    url: 'https://blog.khanacademy.org/',
    description: 'Practical exam preparation advice from Khan Academy educators, including time management and stress reduction techniques.',
    category: 'Exam Prep',
    readTime: '5 min read',
    emoji: '📝',
    subjects: ['all'],
    levels: ['beginner']
  },
  // Computer Science & Software
  {
    id: 'cs1',
    title: 'How to Think Like a Computer Scientist',
    author: 'Allen Downey',
    source: 'greenteapress.com',
    url: 'https://greenteapress.com/wp/think-python-2e/',
    description: 'An excellent introduction to computational thinking, algorithms, and logical structural design using Python.',
    category: 'Computer Science',
    readTime: '15 min read',
    emoji: '💻',
    subjects: ['Computer Science', 'Data Science', 'Machine Learning'],
    levels: ['beginner']
  },
  {
    id: 'cs2',
    title: 'Demystifying Data Structures and Algorithms',
    author: 'BaseCS',
    source: 'medium.com/basecs',
    url: 'https://medium.com/basecs',
    description: 'A beautifully animated, step-by-step breakdown of lists, heaps, sorting, and algorithmic complexity maps.',
    category: 'Algorithms',
    readTime: '8 min read',
    emoji: '🌲',
    subjects: ['Computer Science', 'Web Development'],
    levels: ['intermediate']
  },
  {
    id: 'cs3',
    title: 'The Road to System Design Mastery',
    author: 'ByteByteGo',
    source: 'bytebytego.com',
    url: 'https://bytebytego.com/',
    description: 'Advanced guides covering load balancers, caching, distributed databases, and high-availability architecture scales.',
    category: 'System Design',
    readTime: '12 min read',
    emoji: '⚡',
    subjects: ['Computer Science', 'Electrical Engineering'],
    levels: ['advanced']
  },
  // Mathematics & Calculus
  {
    id: 'math1',
    title: 'Intuitive Guide to Calculus and Limits',
    author: 'BetterExplained',
    source: 'betterexplained.com',
    url: 'https://betterexplained.com/calculus/',
    description: 'An outstanding visual review explaining why calculus derivative rules exist and how to visualize them intuitively.',
    category: 'Mathematics',
    readTime: '10 min read',
    emoji: '📐',
    subjects: ['Mathematics', 'Physics', 'Mechanical Engineering'],
    levels: ['beginner', 'intermediate']
  },
  {
    id: 'math2',
    title: 'Why Abstract Algebra is Secretly Everywhere',
    author: '3Blue1Brown',
    source: '3blue1brown.com',
    url: 'https://www.3blue1brown.com/',
    description: 'A beautiful geometric guide to symmetry groups, rings, vector dimensions, and higher algebraic properties.',
    category: 'Mathematics',
    readTime: '9 min read',
    emoji: '🧮',
    subjects: ['Mathematics', 'Machine Learning'],
    levels: ['advanced']
  },
  // Physics & Mechanics
  {
    id: 'phys1',
    title: 'The Grand Design: Exploring Space-Time Curves',
    author: 'Stephen Hawking',
    source: 'scientificamerican.com',
    url: 'https://www.scientificamerican.com/',
    description: 'Exploring Einstein\'s relativity theorems, space curves, gravity waves, and quantum field behaviors simply.',
    category: 'Physics',
    readTime: '11 min read',
    emoji: '🌌',
    subjects: ['Physics', 'Geography'],
    levels: ['beginner', 'intermediate']
  },
  {
    id: 'phys2',
    title: 'Quantum Computing and Superposition Voids',
    author: 'IBM Quantum',
    source: 'ibm.com/quantum',
    url: 'https://www.ibm.com/topics/quantum-computing',
    description: 'An advanced deep dive into qubits, logic gates, entanglement matrices, and cryogenic quantum processing units.',
    category: 'Physics',
    readTime: '14 min read',
    emoji: '⚛️',
    subjects: ['Physics', 'Computer Science', 'Electrical Engineering'],
    levels: ['advanced']
  },
  // Machine Learning & Data Science
  {
    id: 'ml1',
    title: 'Introduction to Machine Learning Pipelines',
    author: 'Scikit-Learn Team',
    source: 'scikit-learn.org',
    url: 'https://scikit-learn.org/stable/tutorial/index.html',
    description: 'Step-by-step introduction to training estimators, splitting folds, predicting validation labels, and scaling traits.',
    category: 'Machine Learning',
    readTime: '8 min read',
    emoji: '🤖',
    subjects: ['Machine Learning', 'Data Science'],
    levels: ['beginner', 'intermediate']
  },
  {
    id: 'ml2',
    title: 'Deep Learning Mastery: Neural Network Backprop',
    author: 'Andrej Karpathy',
    source: 'karpathy.github.io',
    url: 'https://karpathy.github.io/',
    description: 'Understanding loss gradients, weights matrices, attention vectors, and backpropagation pathways manually.',
    category: 'Machine Learning',
    readTime: '18 min read',
    emoji: '🧠',
    subjects: ['Machine Learning', 'Data Science'],
    levels: ['advanced']
  },
  // Web Development
  {
    id: 'web1',
    title: 'Modern CSS Layouts: Flexbox and Grid Mastery',
    author: 'Rachel Andrew',
    source: 'smashingmagazine.com',
    url: 'https://www.smashingmagazine.com/2020/01/understanding-css-grid-flexbox/',
    description: 'Complete guide to responsive grid margins, flex directions, absolute positions, and media viewport scales.',
    category: 'Web Development',
    readTime: '8 min read',
    emoji: '🌐',
    subjects: ['Web Development'],
    levels: ['beginner', 'intermediate']
  },
  {
    id: 'web2',
    title: 'React Server Components: Under the Hood Architecture',
    author: 'Dan Abramov',
    source: 'overreacted.io',
    url: 'https://overreacted.io/',
    description: 'Deep dive into stream renders, client borders, state dehydration, and React 19 hydration lifecycles.',
    category: 'Web Development',
    readTime: '13 min read',
    emoji: '⚛️',
    subjects: ['Web Development', 'Computer Science'],
    levels: ['advanced']
  },
  // Engineering (Mechanical & Electrical)
  {
    id: 'eng1',
    title: 'All About Circuits Reference Library',
    author: 'EE Experts',
    source: 'allaboutcircuits.com',
    url: 'https://www.allaboutcircuits.com/',
    description: 'Foundational electronics references covering passive components, op-amps, feedback loops, and wave filters.',
    category: 'Electrical Engineering',
    readTime: 'Reference',
    emoji: '🔌',
    subjects: ['Electrical Engineering', 'Physics'],
    levels: ['beginner', 'intermediate', 'advanced']
  },
  {
    id: 'eng2',
    title: 'Engineers Edge: Structural Stress Formulas',
    author: 'Mech Engineering Team',
    source: 'engineersedge.com',
    url: 'https://www.engineersedge.com/',
    description: 'Comprehensive guides for structural dynamics, truss stresses, heat transfer, and mechanical cad alignments.',
    category: 'Mechanical Engineering',
    readTime: 'Reference',
    emoji: '⚙️',
    subjects: ['Mechanical Engineering', 'Physics'],
    levels: ['beginner', 'intermediate', 'advanced']
  }
];

const getRecommendedBlogs = (selectedSubject, selectedDomain, selectedLevel) => {
  const filtered = BLOG_ARTICLES_POOL.filter(blog => {
    // Subject filter
    const matchesSubject = !selectedSubject || 
      selectedSubject === 'Custom' ||
      blog.subjects.includes('all') || 
      blog.subjects.some(s => s.toLowerCase() === selectedSubject.toLowerCase());
    
    // Level filter
    const matchesLevel = !selectedLevel || 
      blog.levels.includes(selectedLevel.toLowerCase());

    return matchesSubject && matchesLevel;
  });

  if (filtered.length > 0) return filtered;
  // Fallback to general productivity/study tips
  return BLOG_ARTICLES_POOL.filter(b => b.subjects.includes('all'));
};

const VIDEO_RESOURCES_POOL = [
  // Computer Science / Web Dev / Data Science / ML
  {
    id: 'CS_TUT_1',
    title: 'Crash Course Computer Science',
    channel: 'CrashCourse',
    views: '4.2M views',
    duration: '11:45',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=O5nskjZ_GoI',
    subject: 'Computer Science',
    domain: 'Crash Course'
  },
  {
    id: 'CS_LEC_1',
    title: 'Introduction to Computer Science and Programming',
    channel: 'MIT OpenCourseWare',
    views: '8.5M views',
    duration: '50:23',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=kQt2LnduKug',
    subject: 'Computer Science',
    domain: 'Full Course Lecture'
  },
  {
    id: 'WEB_TUT_1',
    title: 'HTML & CSS Full Course for Beginners',
    channel: 'SuperSimpleDev',
    views: '12M views',
    duration: '6:12:00',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
    subject: 'Web Development',
    domain: 'Tutorial'
  },
  {
    id: 'WEB_CRASH_1',
    title: 'React JS Crash Course for Beginners',
    channel: 'Traversy Media',
    views: '3.1M views',
    duration: '1:42:15',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
    subject: 'Web Development',
    domain: 'Crash Course'
  },
  {
    id: 'ML_TUT_1',
    title: 'Machine Learning Course for Beginners',
    channel: 'freeCodeCamp.org',
    views: '2.8M views',
    duration: '2:40:00',
    thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=GwIo3gTOB3I',
    subject: 'Machine Learning',
    domain: 'Tutorial'
  },
  {
    id: 'ML_LEC_1',
    title: 'CS229: Machine Learning Lecture 1 (Stanford)',
    channel: 'Stanford Online',
    views: '4.9M views',
    duration: '1:16:00',
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=jGwO_b-YFfk',
    subject: 'Machine Learning',
    domain: 'Full Course Lecture'
  },
  // Mathematics
  {
    id: 'MATH_TUT_1',
    title: 'The Map of Mathematics',
    channel: 'Domain of Science',
    views: '9.2M views',
    duration: '11:06',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=OmJ-4B-mS-Y',
    subject: 'Mathematics',
    domain: 'Tutorial'
  },
  {
    id: 'MATH_CRASH_1',
    title: 'Calculus 1 Full Course',
    channel: 'Professor Leonard',
    views: '3.5M views',
    duration: '2:15:30',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=fYyAMM7KAdY',
    subject: 'Mathematics',
    domain: 'Crash Course'
  },
  {
    id: 'MATH_SOLVE_1',
    title: 'Hardest Calculus Problems Solved Step-by-Step',
    channel: 'Blackpenredpen',
    views: '1.2M views',
    duration: '45:10',
    thumbnail: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=83B6fHn2_iE',
    subject: 'Mathematics',
    domain: 'Problem Solving'
  },
  // Physics
  {
    id: 'PHYS_TUT_1',
    title: 'The Map of Physics',
    channel: 'Domain of Science',
    views: '6.4M views',
    duration: '14:20',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=ZihywtixUYo',
    subject: 'Physics',
    domain: 'Tutorial'
  },
  {
    id: 'PHYS_CRASH_1',
    title: 'AP Physics 1 Review - Session 1',
    channel: 'Advanced Placement',
    views: '920K views',
    duration: '42:15',
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=1tJk905s61k',
    subject: 'Physics',
    domain: 'Exam Preparation'
  },
  // Chemistry
  {
    id: 'CHEM_TUT_1',
    title: 'General Chemistry 1 Review Study Guide',
    channel: 'The Organic Chemistry Tutor',
    views: '2.5M views',
    duration: '2:10:00',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=mDae28Q1K9k',
    subject: 'Chemistry',
    domain: 'Tutorial'
  },
  {
    id: 'CHEM_CRASH_1',
    title: 'Organic Chemistry Introduction Crash Course',
    channel: 'CrashCourse',
    views: '1.9M views',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=U3yG7c9iW0M',
    subject: 'Chemistry',
    domain: 'Crash Course'
  },
  // Biology
  {
    id: 'BIO_TUT_1',
    title: 'Introduction to Cells: The Grand Cell Tour',
    channel: 'Amoeba Sisters',
    views: '6.8M views',
    duration: '9:22',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=8IlzKri08kk',
    subject: 'Biology',
    domain: 'Tutorial'
  },
  // Economics
  {
    id: 'ECON_TUT_1',
    title: 'Microeconomics Crash Course Lecture 1',
    channel: 'Jacob Clifford',
    views: '1.5M views',
    duration: '14:10',
    thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=2YULdjmUtS8',
    subject: 'Economics',
    domain: 'Crash Course'
  }
];

const SUBJECT_KEYWORDS = {
  'mathematics': ['math', 'calc', 'algebra', 'geometry', 'equation', 'number', 'matrix', '3blue1brown', 'leonard', 'derivat', 'integ', 'limit', 'trig'],
  'physics': ['physics', 'quantum', 'mechanic', 'wave', 'thermo', 'gravity', 'force', 'energy', 'einstein', 'relativ', 'motion', 'light', 'electromag'],
  'chemistry': ['chem', 'organic', 'atom', 'molecule', 'reaction', 'periodic', 'bond', 'acid', 'base', 'compound', 'element'],
  'computer science': ['computer', 'program', 'code', 'algorithm', 'data structure', 'python', 'java', 'c++', 'binary', 'software', 'cpu', 'operating system'],
  'biology': ['cell', 'bio', 'dna', 'rna', 'evolution', 'organism', 'gene', 'plant', 'animal', 'ecology', 'mitosis', 'human body'],
  'english': ['english', 'grammar', 'literature', 'writing', 'essay', 'vocab', 'read', 'speak', 'sentence'],
  'history': ['history', 'war', 'revolution', 'century', 'ancient', 'empire', 'historical', 'civilization', 'president'],
  'economics': ['econ', 'macro', 'micro', 'supply', 'demand', 'finance', 'market', 'inflation', 'gdp', 'trade'],
  'geography': ['geography', 'earth', 'map', 'continent', 'ocean', 'climate', 'rock', 'gis', 'landscape'],
  'data science': ['data science', 'statistics', 'panda', 'numpy', 'visualization', 'probability', 'r programming', 'data analysis'],
  'machine learning': ['machine learning', 'neural', 'deep learning', 'regression', 'svm', 'model', 'dataset', 'karpathy', 'tensorflow', 'pytorch', 'ai', 'artificial intelligence'],
  'web development': ['web', 'html', 'css', 'javascript', 'react', 'node', 'frontend', 'backend', 'api', 'website', 'flexbox', 'grid', 'express'],
  'mechanical engineering': ['mechanical', 'thermo', 'stress', 'fluid', 'cad', 'truss', 'engine', 'machine design', 'dynamics', 'force', 'solidworks'],
  'electrical engineering': ['electrical', 'circuit', 'resistor', 'voltage', 'op-amp', 'ee', 'current', 'diode', 'transistor', 'signal', 'multisim', 'arduino']
};

const getRecommendedVideos = (selectedSubject, selectedDomain, backendVideos) => {
  const localMatches = VIDEO_RESOURCES_POOL.filter(vid => {
    const matchesSubject = !selectedSubject || 
      selectedSubject === 'Custom' ||
      vid.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesDomain = !selectedDomain || 
      vid.domain.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSubject && matchesDomain;
  });

  const matchedBackend = (backendVideos || [])
    .map(bv => ({
      id: bv.id,
      title: bv.title || '',
      channel: bv.channel || 'Educational Resource',
      views: bv.views || '100K+ views',
      duration: bv.duration || '10:00',
      thumbnail: bv.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=360&q=80',
      url: bv.url || (bv.id ? `https://www.youtube.com/watch?v=${bv.id}` : '#')
    }))
    .filter(bv => {
      // 1. Ensure the video title matches the chosen subject keywords!
      if (selectedSubject && selectedSubject !== 'Custom') {
        const keywords = SUBJECT_KEYWORDS[selectedSubject.toLowerCase()];
        if (keywords) {
          const lowerTitle = bv.title.toLowerCase();
          const hasKeyword = keywords.some(k => lowerTitle.includes(k));
          if (!hasKeyword) return false;
        }
      }
      // 2. Filter out broken/placeholder dynamic titles
      if (!bv.title || bv.title.includes('undefined') || bv.title.toLowerCase().includes('failed to')) {
        return false;
      }
      return true;
    });

  const combined = [...localMatches, ...matchedBackend.filter(bv => !localMatches.some(lm => lm.title.toLowerCase() === bv.title.toLowerCase()))];
  
  if (combined.length > 0) return combined;
  return VIDEO_RESOURCES_POOL.slice(0, 4);
};

// ─── Share Resource Modal ───────────────────────────────────────────────────
const ShareModal = ({ resource, onClose, user }) => {
  const [toEmail, setToEmail] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/collaborate/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fromEmail: user?.email || '',
          toEmail,
          resourceTitle: resource?.title || 'Study Resource',
          resourceURL: resource?.url || '',
          note,
          senderName: user?.firstName || user?.username || 'A classmate',
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('✅ Resource shared successfully!');
      setToEmail('');
      setNote('');
    } catch {
      setStatus('❌ Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glassmorphism" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="modal-header">
          <span className="modal-icon">🤝</span>
          <h2>Share with a Classmate</h2>
          <p>Send <strong>{resource?.title}</strong> to a peer via email.</p>
        </div>
        {status && <div className={`alert ${status.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{status}</div>}
        <form onSubmit={handleSend} className="auth-form">
          <div className="form-group">
            <label htmlFor="share-email">Recipient Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="share-email"
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="classmate@university.edu"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="share-note">Personal Note (optional)</label>
            <textarea
              id="share-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="This video helped me a lot with the exam!"
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Sending…' : '📤 Send Resource'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Helper to check if a URL is a YouTube link
const isYouTubeUrl = (url) => {
  return url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com'));
};

// Helper to construct a strict YouTube watch URL from video objects
const getYouTubeUrl = (video) => {
  if (!video) return '#';
  if (video.id && (video.id.startsWith('http') || video.id.includes('youtube.com') || video.id.includes('youtu.be'))) {
    return video.id;
  }
  if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
    return video.url;
  }
  const cleanId = video.id ? video.id.trim() : '';
  return `https://www.youtube.com/watch?v=${cleanId}`;
};

const getSafeRedirectUrl = (url, fallbackTitle) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(fallbackTitle || 'education')}`;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.length === 11 && !trimmed.includes(' ') && !trimmed.includes('.')) {
    return `https://www.youtube.com/watch?v=${trimmed}`;
  }
  return `https://${trimmed}`;
};

// ─── Received Resources Panel ───────────────────────────────────────────────
const ReceivedPanel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/collaborate/received`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data || []);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="res-loader"><div className="res-loader-spinner" /><span>Loading shared resources…</span></div>;
  if (items.length === 0) return (
    <div className="res-empty">
      <div className="res-empty-icon">📭</div>
      <h3>No shared resources yet</h3>
      <p>Resources shared by classmates will appear here.</p>
    </div>
  );

  return (
    <div className="received-grid">
      {items.map((item, i) => {
        const isYT = isYouTubeUrl(item.resource_url);
        return (
          <div key={i} className="received-card glassmorphism">
            <div className="received-card-header">
              <span className="received-icon">{isYT ? '📺' : '📚'}</span>
              <div>
                <h4>{item.resource_title || 'Study Resource'}</h4>
                <span className="received-from">From: {item.from_email}</span>
              </div>
            </div>
            {item.note && <p className="received-note">"{item.note}"</p>}
            <a
              href={item.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className={isYT ? "btn-primary res-watch-btn" : "btn-secondary res-watch-btn"}
              style={{ marginTop: '12px', display: 'inline-block' }}
            >
              {isYT ? '▶ Watch on YouTube' : '📖 Open Reference'}
            </a>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Resources Component ───────────────────────────────────────────────
const Resources = () => {
  const { user } = useAuth();
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [subject, setSubject]     = useState('');
  const [domain, setDomain]       = useState('');
  const [level, setLevel]         = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'blogs' | 'shared'
  const [shareModal, setShareModal] = useState(null); // resource object

  /* ── fetch from backend ── */
  const fetchVideos = useCallback(async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE}/resources/search?q=${encodeURIComponent(query + ' english high quality')}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to retrieve videos');
      const data = await res.json();
      setYoutubeVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── auto-load profile-based recommendations on mount ── */
  useEffect(() => {
    if (user?.major) {
      setSubject(user.major);
      fetchVideos(`${user.major} tutorial english`);
    }
  }, [user, fetchVideos]);

  /* ── search handler ── */
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const parts = [];
    
    // Subject matching
    if (subject === 'Custom' && customQuery) {
      parts.push(customQuery);
    } else if (subject && subject !== 'Custom') {
      parts.push(subject);
    }

    // Format/Domain matching
    if (domain) {
      parts.push(domain);
    }

    // Level matching
    if (level) {
      if (level === 'beginner') parts.push('introduction basic');
      else if (level === 'intermediate') parts.push('concepts practice');
      else if (level === 'advanced') parts.push('deep dive masterclass');
    }

    if (parts.length === 0) {
      parts.push('study tips');
    }

    fetchVideos(parts.join(' ') + ' english');
  };

  /* ── quick-tag click ── */
  const handleQuickTag = (tag) => {
    setSubject(tag);
    setDomain('');
    setLevel('');
    setCustomQuery('');
    fetchVideos(`${tag} tutorial english`);
  };

  if (!user) return null;

  return (
    <div className="resources-container fade-in">
      {shareModal && (
        <ShareModal
          resource={shareModal}
          user={user}
          onClose={() => setShareModal(null)}
        />
      )}

      {/* ── Hero Search Panel ── */}
      <div className="res-hero glassmorphism">
        <div className="res-hero-text">
          <h2>🔍 Discover Free Learning Resources</h2>
          <p>Find top-rated YouTube lectures, curated blogs, and receive resources from classmates — all in one place.</p>
        </div>

        <form className="res-search-form" onSubmit={handleSearch}>
          <div className="res-search-row">
            {/* Subject */}
            <div className="form-group res-field">
              <label>Subject / Topic</label>
              {subject === 'Custom' ? (
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Type your subject..."
                  autoFocus
                />
              ) : (
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Select Subject...</option>
                  {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Custom">Other (Type Custom)</option>
                </select>
              )}
            </div>

            {/* Domain */}
            <div className="form-group res-field">
              <label>Domain / Format</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                <option value="">Any Format</option>
                {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Level Dropdown */}
            <div className="form-group res-field">
              <label>Difficulty Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <button type="submit" className="btn-primary res-search-btn">
              🔎 Search
            </button>
          </div>
        </form>

        {/* Quick Tags */}
        <div className="res-quick-tags">
          <span className="tag-label">Popular:</span>
          {['Calculus', 'Data Structures', 'Organic Chemistry', 'Physics Mechanics', 'Machine Learning', 'Study Tips'].map(tag => (
            <button key={tag} className="tag-btn" onClick={() => { handleQuickTag(tag); setActiveTab('videos'); }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* ── Tab Row ── */}
      <div className="res-tab-row">
        <button
          className={`res-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          📺 Video Lectures
        </button>
        <button
          className={`res-tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          📰 Blog Articles
        </button>
        <button
          className={`res-tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          🤝 Shared by Classmates
        </button>
      </div>

      {/* ── Videos Tab ── */}
      {activeTab === 'videos' && (() => {
        const displayedVideos = getRecommendedVideos(subject, domain, youtubeVideos);
        return (
          <>
            {error && <div className="alert alert-error">{error}</div>}
            {loading ? (
              <div className="res-loader">
                <div className="res-loader-spinner" />
                <span>Searching YouTube for top-rated educational content…</span>
              </div>
            ) : displayedVideos.length > 0 ? (
              <>
                <div className="res-results-header">
                  <h3>📺 Found {displayedVideos.length} Educational Videos</h3>
                  <span className="res-results-tag">Sorted by views &amp; relevance</span>
                </div>
                <div className="res-video-grid">
                  {displayedVideos.map((video, idx) => (
                    <div
                      className="res-video-card glassmorphism"
                      key={video.id}
                      style={{ animationDelay: `${idx * 70}ms` }}
                    >
                      <div className="res-thumb-wrap">
                        <img src={video.thumbnail} alt={video.title} className="res-thumb-img" />
                        <span className="res-duration-pill">{video.duration}</span>
                      </div>
                      <div className="res-video-body">
                        <span className="res-channel-name">{video.channel}</span>
                        <h4 className="res-video-title" title={video.title}>{video.title}</h4>
                        <p className="res-video-desc">{video.description || 'Watch highly popular peer lectures and study reviews on this topic.'}</p>
                        <div className="res-video-footer">
                          <span className="res-views-badge">🔥 {video.views}</span>
                          <div className="res-video-actions">
                            <a
                              href={getSafeRedirectUrl(video.url || getYouTubeUrl(video), video.title)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary res-watch-btn"
                            >
                              ▶ Watch on YouTube
                            </a>
                            <button
                              className="btn-secondary res-share-btn"
                              onClick={() => setShareModal({ title: video.title, url: getSafeRedirectUrl(video.url || getYouTubeUrl(video), video.title) })}
                              title="Share with classmate"
                            >
                              🤝 Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : searched ? (
              <div className="res-empty">
                <div className="res-empty-icon">🎓</div>
                <h3>No matching videos found</h3>
                <p>Try broadening your search keywords or selecting a different subject.</p>
              </div>
            ) : null}
          </>
        );
      })()}

      {/* ── Blogs Tab ── */}
      {activeTab === 'blogs' && (
        <div className="blogs-section">
          <div className="res-results-header">
            <h3>📰 Curated Blog Articles & Learning Resources</h3>
            <span className="res-results-tag">Handpicked by educators</span>
          </div>
          <div className="blog-grid">
            {getRecommendedBlogs(subject, domain, level).map((article, idx) => (
              <div
                key={article.id}
                className="blog-card glassmorphism"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="blog-card-header">
                  <span className="blog-emoji">{article.emoji}</span>
                  <span className="blog-category-badge">{article.category}</span>
                </div>
                <h3 className="blog-title">{article.title}</h3>
                <p className="blog-desc">{article.description}</p>
                <div className="blog-footer">
                  <div className="blog-meta">
                    <span className="blog-author">✍️ {article.author}</span>
                    <span className="blog-readtime">⏱ {article.readTime}</span>
                  </div>
                  <div className="blog-actions">
                    <a
                      href={getSafeRedirectUrl(article.url, article.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary res-watch-btn"
                    >
                      📖 Read Article
                    </a>
                    <button
                      className="btn-secondary res-share-btn"
                      onClick={() => setShareModal({ title: article.title, url: getSafeRedirectUrl(article.url, article.title) })}
                    >
                      🤝 Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Shared Resources Tab ── */}
      {activeTab === 'shared' && (
        <div className="shared-section">
          <div className="res-results-header">
            <h3>🤝 Resources Shared by Classmates</h3>
            <span className="res-results-tag">From your collaborators</span>
          </div>
          <ReceivedPanel />
        </div>
      )}
    </div>
  );
};

export default Resources;