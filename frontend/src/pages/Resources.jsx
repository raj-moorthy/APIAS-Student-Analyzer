import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const SUBJECT_OPTIONS = [
  // Pre-Primary & Primary
  'Nursery Rhymes & Alphabets', 'Elementary Math', 'Basic English Phonics', 'Primary Science & Nature',
  // School & College Core
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English Literature', 'History', 'Economics', 'Geography',
  // Advanced & University Specializations
  'Data Science', 'Machine Learning & AI', 'Web Development',
  'Mechanical Engineering', 'Electrical Engineering', 'Research Methodology & Thesis Writing'
];

const DOMAIN_OPTIONS = [
  'Tutorial', 'Full Course Lecture', 'Crash Course',
  'Problem Solving', 'Exam Preparation', 'Lab / Practical',
];

// ─── Curated Blog Articles Pool ──────────────────────────────────────────────
// ─── Curated Blog Articles Pool ──────────────────────────────────────────────
const BLOG_ARTICLES_POOL = [
  // Pre-Primary & Primary
  {
    id: 'kid_rhyme1',
    title: 'Phonics & Alphabet Fun for Kindergarteners',
    author: 'Primary Education Team',
    source: 'starfall.com',
    url: 'https://www.starfall.com/h/index-kindergarten.php',
    description: 'Fun phonics sounds, simple letter matching, and interactive reading tutorials for Lower and Upper Kindergarten.',
    category: 'Educational Activity',
    readTime: '3 min read',
    emoji: '👶',
    subjects: ['Nursery Rhymes & Alphabets', 'Basic English Phonics'],
    domains: ['Tutorial', 'Lab / Practical'],
    difficulty: 'lkg'
  },
  {
    id: 'kid_math1',
    title: 'Counting to 10 with Interactive Colors',
    author: 'Montessori Experts',
    source: 'coolmath4kids.com',
    url: 'https://www.coolmath4kids.com/',
    description: 'An interactive coloring and animal counting guide tailored specifically for LKG and UKG children.',
    category: 'Interactive Game',
    readTime: '5 min read',
    emoji: '🔢',
    subjects: ['Elementary Math'],
    domains: ['Tutorial', 'Lab / Practical'],
    difficulty: 'ukg'
  },
  // General Study Skills & Productivity
  {
    id: 'b1',
    title: 'How to Build a Study Schedule That Actually Works',
    author: 'Ali Abdaal',
    source: 'medium.com/productivity',
    url: 'https://medium.com/@aliabdaal/how-to-study-effectively-spaced-repetition-3a5f80e921d3',
    description: 'Evidence-backed strategies for creating a sustainable study schedule based on active recall.',
    category: 'Medium Blog',
    readTime: '7 min read',
    emoji: '📅',
    subjects: ['all'],
    domains: ['Tutorial', 'Exam Preparation'],
    isMedium: true,
    difficulty: 'ug'
  },
  {
    id: 'b2',
    title: 'The Feynman Technique: Learn Concepts Deeply',
    author: 'James Clear',
    source: 'medium.com/learning',
    url: 'https://medium.com/personal-growth/the-feynman-technique-learn-concepts-deeply-84cd29007c1',
    description: 'Richard Feynman\'s iconic framework to simplify complex concepts and identify your knowledge gaps.',
    category: 'Medium Blog',
    readTime: '6 min read',
    emoji: '🧠',
    subjects: ['all'],
    domains: ['Tutorial', 'Crash Course'],
    isMedium: true,
    difficulty: 'class_6_10'
  },
  // Computer Science & Software
  {
    id: 'cs_rp1',
    title: 'On Computable Numbers, with an Application to the Entscheidungsproblem',
    author: 'Alan M. Turing (1936)',
    source: 'arXiv.org / OpenAccess',
    url: 'https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf',
    description: 'The foundational open-source research paper that established the concept of the Turing Machine and universal computing models.',
    category: 'Research Paper',
    readTime: '36 pages',
    emoji: '🔬',
    subjects: ['Computer Science'],
    domains: ['Full Course Lecture', 'Problem Solving'],
    isResearchPaper: true,
    difficulty: 'phd'
  },
  {
    id: 'cs_med1',
    title: 'Demystifying Data Structures and Algorithms',
    author: 'Vaidehi Joshi',
    source: 'medium.com/basecs',
    url: 'https://medium.com/basecs/deep-diving-into-data-structures-c3c2f0f498b',
    description: 'A beautifully structured, animated guide mapping array lists, binary search trees, and complex graph travels.',
    category: 'Medium Blog',
    readTime: '8 min read',
    emoji: '🌐',
    subjects: ['Computer Science', 'Web Development'],
    domains: ['Tutorial', 'Problem Solving', 'Exam Preparation'],
    isMedium: true,
    difficulty: 'ug'
  },
  // Web Development
  {
    id: 'web_rp1',
    title: 'The Anatomy of a Large-Scale Hypertextual Web Search Engine',
    author: 'Sergey Brin & Lawrence Page (Stanford)',
    source: 'infolab.stanford.edu',
    url: 'http://infolab.stanford.edu/~backrub/google.pdf',
    description: 'The iconic open-source Stanford research paper describing the original PageRank system and early search web crawls.',
    category: 'Research Paper',
    readTime: '18 pages',
    emoji: '🔬',
    subjects: ['Web Development', 'Computer Science'],
    domains: ['Full Course Lecture', 'Problem Solving'],
    isResearchPaper: true,
    difficulty: 'pg'
  },
  {
    id: 'web_med1',
    title: 'CSS Grid vs Flexbox: A Pragmatic Layout Guide',
    author: 'Ahmad Shadeed',
    source: 'medium.com/ux-planet',
    url: 'https://medium.com/ux-planet/css-grid-vs-flexbox-a-practical-guide-b1d5cbf0662d',
    description: 'Real-world visual walkthrough of responsive margins, viewport alignments, layouts, and relative positioning.',
    category: 'Medium Blog',
    readTime: '9 min read',
    emoji: '🌐',
    subjects: ['Web Development'],
    domains: ['Tutorial', 'Lab / Practical'],
    isMedium: true,
    difficulty: 'ug'
  },
  // Machine Learning
  {
    id: 'ml_rp1',
    title: 'Attention Is All You Need',
    author: 'Ashish Vaswani et al. (Google Brain)',
    source: 'arXiv.org',
    url: 'https://arxiv.org/abs/1706.03762',
    description: 'The seminal transformer research paper replacing recurrent architectures with self-attention networks.',
    category: 'Research Paper',
    readTime: '15 pages',
    emoji: '🔬',
    subjects: ['Machine Learning & AI', 'Computer Science'],
    domains: ['Full Course Lecture', 'Problem Solving'],
    isResearchPaper: true,
    difficulty: 'phd'
  },
  {
    id: 'ml_med1',
    title: 'The Essential Guide to Neural Networks and Backpropagation',
    author: 'Towards Data Science',
    source: 'towardsdatascience.com',
    url: 'https://towardsdatascience.com/understanding-backpropagation-ab6c3a8d8e52',
    description: 'An interactive mathematical walkthrough of multi-layer perceptrons, active functions, and gradient steps.',
    category: 'Medium Blog',
    readTime: '12 min read',
    emoji: '🌐',
    subjects: ['Machine Learning & AI'],
    domains: ['Tutorial', 'Crash Course', 'Problem Solving'],
    isMedium: true,
    difficulty: 'pg'
  },
  // Mathematics
  {
    id: 'math_rp1',
    title: 'A Symbolic Analysis of Relay and Switching Circuits',
    author: 'Claude E. Shannon (MIT, 1938)',
    source: 'dspace.mit.edu',
    url: 'https://dspace.mit.edu/handle/1721.1/11173',
    description: 'The legendary master\'s research paper applying Boolean algebra to electric switch circuits, establishing digital logic.',
    category: 'Research Paper',
    readTime: '45 pages',
    emoji: '🔬',
    subjects: ['Mathematics', 'Computer Science'],
    domains: ['Full Course Lecture', 'Problem Solving'],
    isResearchPaper: true,
    difficulty: 'phd'
  },
  {
    id: 'math_med1',
    title: 'Linear Algebra Visualized: Eigenvalues and Eigenvectors',
    author: '3Blue1Brown Team',
    source: 'medium.com/math',
    url: 'https://medium.com/@3blue1brown/linear-algebra-visualized-eigenvalues-6e42b291d293',
    description: 'A beautiful visual exposition of vector shears, space dimension stretches, and coordinate transforms.',
    category: 'Medium Blog',
    readTime: '9 min read',
    emoji: '🌐',
    subjects: ['Mathematics', 'Machine Learning & AI'],
    domains: ['Tutorial', 'Crash Course'],
    isMedium: true,
    difficulty: 'ug'
  },
  // Physics
  {
    id: 'phys_rp1',
    title: 'On the Electrodynamics of Moving Bodies (Special Relativity)',
    author: 'Albert Einstein (1905)',
    source: 'fourmilab.ch / OpenAccess',
    url: 'https://www.fourmilab.ch/etexts/einstein/specrel/specrel.pdf',
    description: 'Einstein\'s original open-access research paper redefining space-time intervals, coordinate transformations, and light velocities.',
    category: 'Research Paper',
    readTime: '23 pages',
    emoji: '🔬',
    subjects: ['Physics'],
    domains: ['Full Course Lecture', 'Problem Solving'],
    isResearchPaper: true,
    difficulty: 'phd'
  },
  {
    id: 'phys_med1',
    title: 'Quantum Mechanics Explained for Beginners',
    author: 'Physics Network',
    source: 'medium.com/physics',
    url: 'https://medium.com/physics-made-simple/quantum-mechanics-explained-for-beginners-a1d3bcbf9e6a',
    description: 'An interactive visual guide covering superposition thresholds, qubits, wave particle dualities, and spin orbits.',
    category: 'Medium Blog',
    readTime: '11 min read',
    emoji: '🌐',
    subjects: ['Physics'],
    domains: ['Tutorial', 'Crash Course'],
    isMedium: true,
    difficulty: 'class_11_12'
  },
  // Biology
  {
    id: 'bio_rp1',
    title: 'Molecular Structure of Nucleic Acids (DNA Structure)',
    author: 'Watson J.D. & Crick F.H.C. (1953)',
    source: 'nature.com / OpenAccess',
    url: 'https://www.nature.com/articles/171737a0.pdf',
    description: 'The landmark open-access paper presenting the double-helix model of DNA molecule structures.',
    category: 'Research Paper',
    readTime: '2 pages',
    emoji: '🔬',
    subjects: ['Biology', 'Chemistry'],
    domains: ['Full Course Lecture', 'Lab / Practical'],
    isResearchPaper: true,
    difficulty: 'phd'
  },
  // Economics
  {
    id: 'econ_rp1',
    title: 'A Theory of Production (Cobbs-Douglas Function)',
    author: 'Charles W. Cobb & Paul H. Douglas (1928)',
    source: 'aeaweb.org / OpenAccess',
    url: 'https://www.aeaweb.org/aer/top20/18.1.139-165.pdf',
    description: 'The classical open-access research paper mathematically relating production outputs to capital and labor factors.',
    category: 'Research Paper',
    readTime: '27 pages',
    emoji: '🔬',
    subjects: ['Economics'],
    domains: ['Full Course Lecture', 'Problem Solving'],
    isResearchPaper: true,
    difficulty: 'phd'
  },
  // PhD Special
  {
    id: 'phd_thesis1',
    title: 'How to Write a Stellar PhD Dissertation & Literature Review',
    author: 'Dr. Sarah Peterson (Oxford)',
    source: 'nature.com/careers',
    url: 'https://www.nature.com/articles/d41586-020-00102-x',
    description: 'A step-by-step masterclass on formulating a thesis question, structuring your literature review, and passing the viva.',
    category: 'Academic Guide',
    readTime: '15 min read',
    emoji: '🎓',
    subjects: ['Research Methodology & Thesis Writing'],
    domains: ['Full Course Lecture', 'Exam Preparation'],
    difficulty: 'phd'
  }
];

const getRecommendedBlogs = (selectedSubject, selectedDomain, selectedLevel) => {
  const filtered = BLOG_ARTICLES_POOL.filter(blog => {
    // 1. Subject filter
    const matchesSubject = !selectedSubject || 
      selectedSubject === 'Custom' ||
      blog.subjects.includes('all') || 
      blog.subjects.some(s => s.toLowerCase() === selectedSubject.toLowerCase());
    
    // 2. Domain/Format filter
    const matchesDomain = !selectedDomain || 
      blog.domains.includes('all') ||
      blog.domains.some(d => d.toLowerCase() === selectedDomain.toLowerCase());

    // 3. Level filter
    const matchesLevel = !selectedLevel || 
      blog.difficulty === selectedLevel;

    return matchesSubject && matchesDomain && matchesLevel;
  });

  if (filtered.length > 0) return filtered;
  
  // Fallback ignoring level
  const subDomainFiltered = BLOG_ARTICLES_POOL.filter(blog => {
    const matchesSubject = !selectedSubject || 
      selectedSubject === 'Custom' ||
      blog.subjects.includes('all') || 
      blog.subjects.some(s => s.toLowerCase() === selectedSubject.toLowerCase());
    const matchesDomain = !selectedDomain || 
      blog.domains.includes('all') ||
      blog.domains.some(d => d.toLowerCase() === selectedDomain.toLowerCase());
    return matchesSubject && matchesDomain;
  });
  if (subDomainFiltered.length > 0) return subDomainFiltered;

  return BLOG_ARTICLES_POOL.filter(b => b.subjects.includes('all') || b.difficulty === 'ug');
};

const VIDEO_RESOURCES_POOL = [
  // LKG / UKG / Kids Rhymes & Phonics
  {
    id: 'KID_RHYME_VID',
    title: 'Phonics Song with Two Words - A to Z Phonics Rhymes',
    channel: 'Chuchu TV Nursery Rhymes',
    views: '450M views',
    duration: '6:12',
    thumbnail: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=hq3yfQnllfQ',
    subject: 'Nursery Rhymes & Alphabets',
    domain: 'Tutorial',
    difficulty: 'lkg'
  },
  {
    id: 'KID_MATH_VID',
    title: 'Numbers Song 1 to 10 - Counting Nursery Rhymes for Kids',
    channel: 'Cocomelon Nursery Rhymes',
    views: '820M views',
    duration: '3:45',
    thumbnail: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=V_0Z_tG8_J0',
    subject: 'Elementary Math',
    domain: 'Tutorial',
    difficulty: 'ukg'
  },
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
    domain: 'Crash Course',
    difficulty: 'class_6_10'
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
    domain: 'Full Course Lecture',
    difficulty: 'ug'
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
    domain: 'Tutorial',
    difficulty: 'class_11_12'
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
    domain: 'Crash Course',
    difficulty: 'ug'
  },
  {
    id: 'ML_TUT_1',
    title: 'Machine Learning Course for Beginners',
    channel: 'freeCodeCamp.org',
    views: '2.8M views',
    duration: '2:40:00',
    thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=GwIo3gTOB3I',
    subject: 'Machine Learning & AI',
    domain: 'Tutorial',
    difficulty: 'ug'
  },
  {
    id: 'ML_LEC_1',
    title: 'CS229: Machine Learning Lecture 1 (Stanford)',
    channel: 'Stanford Online',
    views: '4.9M views',
    duration: '1:16:00',
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=jGwO_b-YFfk',
    subject: 'Machine Learning & AI',
    domain: 'Full Course Lecture',
    difficulty: 'pg'
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
    domain: 'Tutorial',
    difficulty: 'class_6_10'
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
    domain: 'Crash Course',
    difficulty: 'ug'
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
    domain: 'Problem Solving',
    difficulty: 'pg'
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
    domain: 'Tutorial',
    difficulty: 'class_6_10'
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
    domain: 'Exam Preparation',
    difficulty: 'class_11_12'
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
    domain: 'Tutorial',
    difficulty: 'class_11_12'
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
    domain: 'Crash Course',
    difficulty: 'class_11_12'
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
    domain: 'Tutorial',
    difficulty: 'class_1_5'
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
    domain: 'Crash Course',
    difficulty: 'class_11_12'
  },
  // PhD Special
  {
    id: 'PHD_THESIS_VID',
    title: 'How to Write a Literature Review (PhD & Master\'s level)',
    channel: 'Grad Coach',
    views: '540K views',
    duration: '15:20',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=360&q=80',
    url: 'https://www.youtube.com/watch?v=N4t_1b1u7K8',
    subject: 'Research Methodology & Thesis Writing',
    domain: 'Full Course Lecture',
    difficulty: 'phd'
  }
];

const SUBJECT_KEYWORDS = {
  'mathematics': ['math', 'calc', 'algebra', 'geometry', 'equation', 'number', 'matrix', '3blue1brown', 'leonard', 'derivat', 'integ', 'limit', 'trig'],
  'physics': ['physics', 'quantum', 'mechanic', 'wave', 'thermo', 'gravity', 'force', 'energy', 'einstein', 'relativ', 'motion', 'light', 'electromag'],
  'chemistry': ['chem', 'organic', 'atom', 'molecule', 'reaction', 'periodic', 'bond', 'acid', 'base', 'compound', 'element'],
  'computer science': ['computer', 'program', 'code', 'algorithm', 'data structure', 'python', 'java', 'c++', 'binary', 'software', 'cpu', 'operating system'],
  'biology': ['cell', 'bio', 'dna', 'rna', 'evolution', 'organism', 'gene', 'plant', 'animal', 'ecology', 'mitosis', 'human body'],
  'english literature': ['english', 'grammar', 'literature', 'writing', 'essay', 'vocab', 'read', 'speak', 'sentence', 'shakespeare', 'novel'],
  'history': ['history', 'war', 'revolution', 'century', 'ancient', 'empire', 'historical', 'civilization', 'president'],
  'economics': ['econ', 'macro', 'micro', 'supply', 'demand', 'finance', 'market', 'inflation', 'gdp', 'trade'],
  'geography': ['geography', 'earth', 'map', 'continent', 'ocean', 'climate', 'rock', 'gis', 'landscape'],
  'data science': ['data science', 'statistics', 'panda', 'numpy', 'visualization', 'probability', 'r programming', 'data analysis'],
  'machine learning & ai': ['machine learning', 'neural', 'deep learning', 'regression', 'svm', 'model', 'dataset', 'karpathy', 'tensorflow', 'pytorch', 'ai', 'artificial intelligence'],
  'web development': ['web', 'html', 'css', 'javascript', 'react', 'node', 'frontend', 'backend', 'api', 'website', 'flexbox', 'grid', 'express'],
  'mechanical engineering': ['mechanical', 'thermo', 'stress', 'fluid', 'cad', 'truss', 'engine', 'machine design', 'dynamics', 'force', 'solidworks'],
  'electrical engineering': ['electrical', 'circuit', 'resistor', 'voltage', 'op-amp', 'ee', 'current', 'diode', 'transistor', 'signal', 'multisim', 'arduino'],
  'nursery rhymes & alphabets': ['rhymes', 'alphabet', 'phonics', 'kids song', 'nursery', 'cocomelon', 'cartoon', 'toddler', 'kindergarten', 'sing'],
  'elementary math': ['counting', 'addition', 'subtraction', 'numbers', 'math for kids', 'multiply', 'cool math', 'elementary'],
  'basic english phonics': ['phonics', 'abc', 'vowel', 'letters', 'spell', 'reading for kids', 'sounds'],
  'primary science & nature': ['science for kids', 'nature', 'animal sounds', 'planet earth', 'plant life', 'water cycle', 'basic science'],
  'research methodology & thesis writing': ['thesis', 'literature review', 'dissertation', 'research proposal', 'academic writing', 'phd writing', 'methodology', 'viva']
};

const getRecommendedVideos = (selectedSubject, selectedDomain, selectedLevel, backendVideos) => {
  const localMatches = VIDEO_RESOURCES_POOL.filter(vid => {
    const matchesSubject = !selectedSubject || 
      selectedSubject === 'Custom' ||
      vid.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesDomain = !selectedDomain || 
      vid.domain.toLowerCase() === selectedDomain.toLowerCase();
    const matchesLevel = !selectedLevel || 
      vid.difficulty === selectedLevel;
    return matchesSubject && matchesDomain && matchesLevel;
  });

  const matchedBackend = (backendVideos || [])
    .map(bv => {
      // Adaptive level inference for universal spectrum
      let inferredDiff = 'ug';
      const titleLower = (bv.title || '').toLowerCase();
      if (titleLower.includes('rhymes') || titleLower.includes('kids song') || titleLower.includes('phonics') || titleLower.includes('cocomelon') || titleLower.includes('cartoon')) {
        inferredDiff = 'lkg';
      } else if (titleLower.includes('nursery') || titleLower.includes('kindergarten') || titleLower.includes('preschool')) {
        inferredDiff = 'ukg';
      } else if (titleLower.includes('elementary') || titleLower.includes('grade 1') || titleLower.includes('grade 2') || titleLower.includes('grade 3')) {
        inferredDiff = 'class_1_5';
      } else if (titleLower.includes('class 6') || titleLower.includes('class 8') || titleLower.includes('middle school') || titleLower.includes('class 10')) {
        inferredDiff = 'class_6_10';
      } else if (titleLower.includes('class 12') || titleLower.includes('board preparation') || titleLower.includes('neet') || titleLower.includes('jee')) {
        inferredDiff = 'class_11_12';
      } else if (titleLower.includes('thesis') || titleLower.includes('dissertation') || titleLower.includes('defense') || titleLower.includes('literature review')) {
        inferredDiff = 'phd';
      } else if (titleLower.includes('masters') || titleLower.includes('advanced paper') || titleLower.includes('research paper')) {
        inferredDiff = 'pg';
      }
      
      return {
        id: bv.id,
        title: bv.title || '',
        channel: bv.channel || 'Educational Resource',
        views: bv.views || '100K+ views',
        duration: bv.duration || '10:00',
        thumbnail: bv.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=360&q=80',
        url: bv.url || (bv.id ? `https://www.youtube.com/watch?v=${bv.id}` : '#'),
        difficulty: inferredDiff
      };
    })
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
      // 2. Level filter for backend videos
      if (selectedLevel && bv.difficulty !== selectedLevel) {
        return false;
      }
      // 3. Filter out broken/placeholder dynamic titles
      if (!bv.title || bv.title.includes('undefined') || bv.title.toLowerCase().includes('failed to')) {
        return false;
      }
      return true;
    });

  const combined = [...localMatches, ...matchedBackend.filter(bv => !localMatches.some(lm => lm.title.toLowerCase() === bv.title.toLowerCase()))];
  
  if (combined.length > 0) return combined;

  // Fallback ignoring level
  const localFallback = VIDEO_RESOURCES_POOL.filter(vid => {
    const matchesSubject = !selectedSubject || 
      selectedSubject === 'Custom' ||
      vid.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesDomain = !selectedDomain || 
      vid.domain.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSubject && matchesDomain;
  });
  if (localFallback.length > 0) return localFallback.slice(0, 4);

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
const ReceivedPanel = ({ refreshTrigger }) => {
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
  }, [refreshTrigger]);

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

// ─── Sent Resources Panel ─────────────────────────────────────────────────
const SentPanel = ({ refreshTrigger }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/collaborate/sent`, {
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
  }, [refreshTrigger]);

  if (loading) return <div className="res-loader"><div className="res-loader-spinner" /><span>Loading sent resources…</span></div>;
  if (items.length === 0) return (
    <div className="res-empty">
      <div className="res-empty-icon">📤</div>
      <h3>No shared resources sent yet</h3>
      <p>Resources you share with classmates will show up here.</p>
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
                <span className="received-from">To: {item.to_email}</span>
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

// ─── Direct Share Form Component ──────────────────────────────────────────
const DirectShareForm = ({ user, onShareSuccess }) => {
  const [toEmail, setToEmail] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/collaborate/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fromEmail: user?.email || '',
          toEmail,
          resourceTitle: title,
          resourceURL: url,
          note,
          senderName: user?.firstName || user?.username || 'A classmate',
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('✅ Resource shared successfully!');
      setToEmail('');
      setTitle('');
      setUrl('');
      setNote('');
      if (onShareSuccess) onShareSuccess();
    } catch {
      setStatus('❌ Failed to share. Check recipient email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="direct-share-card glassmorphism" style={{ maxWidth: '550px', margin: '0 auto', padding: '28px', borderRadius: '16px' }}>
      <div className="modal-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <span className="modal-icon">🤝</span>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-color)', margin: '0 0 4px' }}>Share with a Classmate</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Send any video, website, or reference link to a classmate's email instantly.</p>
      </div>
      {status && <div className={`alert ${status.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '16px' }}>{status}</div>}
      <form onSubmit={handleSend} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Recipient Email</label>
          <input
            type="email"
            value={toEmail}
            onChange={e => setToEmail(e.target.value)}
            placeholder="classmate@university.edu"
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
          />
        </div>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Resource Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Feynman Technique Guide"
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
          />
        </div>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Resource URL / Link</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/study-material"
            required
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
          />
        </div>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Personal Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Hope this helps you with this week's assignments!"
            rows={3}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', resize: 'vertical' }}
          />
        </div>
        <button type="submit" className="btn-primary auth-btn" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)', color: '#fff' }}>
          {loading ? 'Sharing…' : '📤 Send Resource'}
        </button>
      </form>
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

  const [collabSubTab, setCollabSubTab] = useState('received'); // 'received' | 'sent' | 'share'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  /* ── Fetch sent/received resource counts dynamically ── */
  useEffect(() => {
    if (activeTab === 'shared') {
      const fetchCounts = async () => {
        try {
          const token = localStorage.getItem('token');
          const [resRec, resSent] = await Promise.all([
            fetch(`${API_BASE}/collaborate/received`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE}/collaborate/sent`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (resRec.ok) {
            const d = await resRec.json();
            setReceivedCount(d.length || 0);
          }
          if (resSent.ok) {
            const d = await resSent.json();
            setSentCount(d.length || 0);
          }
        } catch (e) {
          console.error("Failed to load collaboration counts", e);
        }
      };
      fetchCounts();
    }
  }, [activeTab, refreshTrigger]);

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

    // Level matching for dynamic search modifier
    if (level) {
      if (level === 'lkg' || level === 'ukg') {
        parts.push('nursery rhymes songs kids animated cartoon fun phonics learn');
      } else if (level === 'class_1_5') {
        parts.push('for kids elementary primary school science lesson animation');
      } else if (level === 'class_6_10') {
        parts.push('middle school high school grade syllabus cbse tutor');
      } else if (level === 'class_11_12') {
        parts.push('class 11 class 12 board exam preparation crash course AP');
      } else if (level === 'ug') {
        parts.push('university lecture undergraduate college course curriculum engineering');
      } else if (level === 'pg') {
        parts.push('postgraduate masters degree advanced paper study seminar');
      } else if (level === 'phd') {
        parts.push('phd research thesis academic paper methodology dissertation defense');
      }
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
              <label>Academic Grade / Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Any Level</option>
                <optgroup label="Kindergarten / Pre-Primary">
                  <option value="lkg">LKG (Lower Kindergarten)</option>
                  <option value="ukg">UKG (Upper Kindergarten)</option>
                </optgroup>
                <optgroup label="School Education">
                  <option value="class_1_5">Class 1 to 5 (Primary)</option>
                  <option value="class_6_10">Class 6 to 10 (Secondary)</option>
                  <option value="class_11_12">Class 11 & 12 (Higher Secondary)</option>
                </optgroup>
                <optgroup label="Higher Education">
                  <option value="ug">Undergraduate (UG / Bachelors)</option>
                  <option value="pg">Postgraduate (PG / Masters)</option>
                  <option value="phd">Doctorate (PhD / Research)</option>
                </optgroup>
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
        const displayedVideos = getRecommendedVideos(subject, domain, level, youtubeVideos);
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
                  <span className={`blog-category-badge ${article.isResearchPaper ? 'research-badge' : article.isMedium ? 'medium-badge' : ''}`}>
                    {article.isResearchPaper ? '🔬 Research Paper' : article.isMedium ? '🌐 Medium Blog' : article.category}
                  </span>
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
                      style={article.isMedium ? { background: 'linear-gradient(135deg, #00ab6c 0%, #008f58 100%)', borderColor: '#008f58' } : article.isResearchPaper ? { background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', borderColor: '#3730a3' } : {}}
                    >
                      {article.isResearchPaper ? '🔬 Read Research Paper' : article.isMedium ? '📖 Read on Medium' : '📖 Read Article'}
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
          <div className="res-results-header" style={{ marginBottom: '16px' }}>
            <h3>🤝 Classmate Collaboration Desk</h3>
            <span className="res-results-tag">Share knowledge with your peers</span>
          </div>

          {/* Sub Tab Navigation */}
          <div className="sub-tab-nav" style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
            <button
              className={`tag-btn ${collabSubTab === 'received' ? 'active' : ''}`}
              onClick={() => setCollabSubTab('received')}
              style={collabSubTab === 'received' ? { background: 'var(--primary-color)', color: '#fff', boxShadow: 'var(--premium-glow)' } : {}}
            >
              📥 Received ({receivedCount})
            </button>
            <button
              className={`tag-btn ${collabSubTab === 'sent' ? 'active' : ''}`}
              onClick={() => setCollabSubTab('sent')}
              style={collabSubTab === 'sent' ? { background: 'var(--primary-color)', color: '#fff', boxShadow: 'var(--premium-glow)' } : {}}
            >
              📤 Sent ({sentCount})
            </button>
            <button
              className={`tag-btn ${collabSubTab === 'share' ? 'active' : ''}`}
              onClick={() => setCollabSubTab('share')}
              style={collabSubTab === 'share' ? { background: 'var(--primary-color)', color: '#fff', boxShadow: 'var(--premium-glow)' } : {}}
            >
              ＋ Share New Link
            </button>
          </div>

          {collabSubTab === 'received' && <ReceivedPanel refreshTrigger={refreshTrigger} />}
          {collabSubTab === 'sent' && <SentPanel refreshTrigger={refreshTrigger} />}
          {collabSubTab === 'share' && (
            <DirectShareForm
              user={user}
              onShareSuccess={() => {
                setRefreshTrigger(prev => prev + 1);
                setCollabSubTab('sent'); // redirect to sent panel automatically!
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;