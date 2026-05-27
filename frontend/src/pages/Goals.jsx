import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Helper to generate dynamic sub-tasks and educational resources based on the goal title / category
const generateSubtasksAndResources = (title, category) => {
  const query = title.toLowerCase();
  
  // 1. Data Science & Machine Learning
  if (query.includes('ml') || query.includes('machine learning') || query.includes('ai') || query.includes('data science') || query.includes('intelligence')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Master Linear Regression, Logistic Regression & Decision Trees', completed: false },
        { id: 'st2', text: 'Watch Andrew Ng\'s introductory Machine Learning lessons', completed: false },
        { id: 'st3', text: 'Build a basic classifier model in Python using Scikit-Learn', completed: false },
        { id: 'st4', text: 'Implement model evaluation metrics (Precision, Recall, F1-Score)', completed: false }
      ],
      resources: [
        { title: 'Andrew Ng - Machine Learning Course Lectures', url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXSihR4arHS7mIBt', type: 'video' },
        { title: 'Scikit-Learn Official Getting Started Tutorial', url: 'https://scikit-learn.org/stable/getting_started.html', type: 'guide' }
      ]
    };
  }

  // 2. Physics
  if (query.includes('physics') || query.includes('mechanics') || query.includes('quantum') || query.includes('electromagnetism') || query.includes('thermodynamics')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Analyze mechanical kinematics and draw free-body static diagrams', completed: false },
        { id: 'st2', text: 'Solve 10 practice problems on electromagnetic fields & Maxwell\'s equations', completed: false },
        { id: 'st3', text: 'Watch graphic simulations of quantum dynamics or relativity theories', completed: false }
      ],
      resources: [
        { title: 'Physics - Classical Mechanics Lectures by Walter Lewin', url: 'https://www.youtube.com/playlist?list=PLyQSN7X0RO32a0F7gS4vWfE5Oec1c4L4N', type: 'video' },
        { title: 'MIT OpenCourseWare Physics I Course Notes', url: 'https://ocw.mit.edu/courses/physics/', type: 'guide' }
      ]
    };
  }

  // 3. Chemistry
  if (query.includes('chem') || query.includes('chemistry') || query.includes('organic') || query.includes('stoichiometry') || query.includes('molecular')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Balance complex chemical oxidation-reduction equations', completed: false },
        { id: 'st2', text: 'Understand organic hydrocarbon structures and IUPAC rules', completed: false },
        { id: 'st3', text: 'Review molecular bonding geometries and thermodynamic laws', completed: false }
      ],
      resources: [
        { title: 'Crash Course Chemistry Lectures', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr', type: 'video' },
        { title: 'LibreTexts Online Chemistry Library', url: 'https://chem.libretexts.org/', type: 'guide' }
      ]
    };
  }

  // 4. Biology
  if (query.includes('bio') || query.includes('biology') || query.includes('cellular') || query.includes('genetics') || query.includes('ecosystem')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Study Krebs cell respiration cycle and photosynthesis steps', completed: false },
        { id: 'st2', text: 'Detail genomic transcription, replication, and translation phases', completed: false },
        { id: 'st3', text: 'Diagram ecological carbon flows and natural selection rules', completed: false }
      ],
      resources: [
        { title: 'Crash Course Biology Lecture Playlist', url: 'https://www.youtube.com/playlist?list=PL3EED4C1D684D3ADF', type: 'video' },
        { title: 'NCBI Cellular Molecular Biology Online Books', url: 'https://www.ncbi.nlm.nih.gov/books/', type: 'guide' }
      ]
    };
  }

  // 5. English / Literature
  if (query.includes('english') || query.includes('literature') || query.includes('essay') || query.includes('writing') || query.includes('grammar')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Analyze narrative structures, main themes, and character symbolism', completed: false },
        { id: 'st2', text: 'Draft a well-researched thesis and descriptive academic outline', completed: false },
        { id: 'st3', text: 'Proofread sentences for voice, active verbs, and correct styling', completed: false }
      ],
      resources: [
        { title: 'Crash Course World Literature Lectures', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtOtMglqyk8-K96B5056_uy_', type: 'video' },
        { title: 'Purdue Online Writing Lab Reference Guide', url: 'https://owl.purdue.edu/', type: 'guide' }
      ]
    };
  }

  // 6. History
  if (query.includes('history') || query.includes('revolution') || query.includes('war') || query.includes('civilization') || query.includes('treaty')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Map timeline of global political revolutions and economic catalysts', completed: false },
        { id: 'st2', text: 'Examine primary documents to dissect bias and political viewpoints', completed: false },
        { id: 'st3', text: 'Summarize post-war geopolitical alliances and historic treaties', completed: false }
      ],
      resources: [
        { title: 'Crash Course World History Lecture Series', url: 'https://www.youtube.com/playlist?list=PLBDA2E52FB1EF80C9', type: 'video' },
        { title: 'History Channel Digital Educational Archives', url: 'https://www.history.com/', type: 'guide' }
      ]
    };
  }

  // 7. Economics
  if (query.includes('eco') || query.includes('economics') || query.includes('finance') || query.includes('macro') || query.includes('micro')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Graph supply-demand elasticity curves and market equilibrium shifts', completed: false },
        { id: 'st2', text: 'Define macro indicators like GDP, inflation rates, and cash reserves', completed: false },
        { id: 'st3', text: 'Examine monopoly, oligopoly, and game theory payoff grids', completed: false }
      ],
      resources: [
        { title: 'Crash Course Economics Full Playlist', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gUAyrEO', type: 'video' },
        { title: 'Investopedia Premium Economics Reference Library', url: 'https://www.investopedia.com/', type: 'guide' }
      ]
    };
  }

  // 8. Geography
  if (query.includes('geo') || query.includes('geography') || query.includes('climate') || query.includes('demographics') || query.includes('cartography')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Trace tectonic boundaries, continental drift patterns, and fault lines', completed: false },
        { id: 'st2', text: 'Synthesize demographic pyramids and global resource trade routes', completed: false },
        { id: 'st3', text: 'Evaluate climate zones and topographic contour gradient maps', completed: false }
      ],
      resources: [
        { title: 'Crash Course Geography Video Lectures', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtO85SldrXc1ObipmYrVQA_P', type: 'video' },
        { title: 'National Geographic Global Interactive Education Hub', url: 'https://www.nationalgeographic.org/education/', type: 'guide' }
      ]
    };
  }

  // 9. Mechanical Engineering
  if (query.includes('mechanical') || query.includes('mech') || query.includes('engineering statics') || query.includes('cad') || query.includes('solidworks')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Perform mechanical stress-strain analysis on structural trusses', completed: false },
        { id: 'st2', text: 'Calculate thermal cycles (ideal Carnot and Rankine models)', completed: false },
        { id: 'st3', text: 'Build a parametric solid model with CAD geometric constraints', completed: false }
      ],
      resources: [
        { title: 'MIT 2.003SC Engineering Dynamics Course Lectures', url: 'https://www.youtube.com/playlist?list=PL46BDD3E68B2FC352', type: 'video' },
        { title: 'Engineers Edge Technical Mechanics Archive', url: 'https://www.engineersedge.com/', type: 'guide' }
      ]
    };
  }

  // 10. Electrical Engineering
  if (query.includes('electrical') || query.includes('circuit') || query.includes('ee') || query.includes('amplifier') || query.includes('op-amp')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Apply Kirchhoff\'s loop and nodal laws to complex AC/DC circuits', completed: false },
        { id: 'st2', text: 'Design basic op-amp filters (low-pass, bandpass configurations)', completed: false },
        { id: 'st3', text: 'Graph sinusoidal signal frequencies using Fourier transform graphs', completed: false }
      ],
      resources: [
        { title: 'Neso Academy - Electrical Engineering Circuits', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiw-GVq7Egi_9m52dPP-Y4o', type: 'video' },
        { title: 'All About Circuits Interactive Reference Book', url: 'https://www.allaboutcircuits.com/', type: 'guide' }
      ]
    };
  }

  // 11. Mathematics / Calculus (General)
  if (query.includes('calculus') || query.includes('math') || query.includes('algebra') || query.includes('geometry') || query.includes('stats') || query.includes('statistics')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Revise foundational derivatives and limits rules', completed: false },
        { id: 'st2', text: 'Complete 15 practice problems on optimization & integration', completed: false },
        { id: 'st3', text: 'Watch 3Blue1Brown graphical visualizations on the subject', completed: false }
      ],
      resources: [
        { title: '3Blue1Brown - Essence of Calculus Series', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', type: 'video' },
        { title: 'Khan Academy Calculus Concept Exercises', url: 'https://www.khanacademy.org/math/calculus-1', type: 'guide' }
      ]
    };
  }

  // 12. Web Development
  if (query.includes('web') || query.includes('react') || query.includes('js') || query.includes('javascript') || query.includes('frontend') || query.includes('html') || query.includes('css') || query.includes('node')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Complete responsive layout with modern CSS Flexbox/Grid', completed: false },
        { id: 'st2', text: 'Build React components, state hooks, and custom context hooks', completed: false },
        { id: 'st3', text: 'Connect frontend actions to backend JSON REST endpoints', completed: false }
      ],
      resources: [
        { title: 'React JS Crash Course - Traversy Media', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', type: 'video' },
        { title: 'MDN Web Docs - Javascript Reference Guide', url: 'https://developer.mozilla.org/', type: 'guide' }
      ]
    };
  }

  // 13. Computer Science / DSA / Programming
  if (query.includes('computer science') || query.includes('cs') || query.includes('python') || query.includes('coding') || query.includes('programming') || query.includes('java') || query.includes('c++') || query.includes('dsa') || query.includes('algorithms')) {
    return {
      subtasks: [
        { id: 'st1', text: 'Understand core logic flow, loops, and custom function definitions', completed: false },
        { id: 'st2', text: 'Complete 3 coding challenges on arrays & hash maps', completed: false },
        { id: 'st3', text: 'Build a practical terminal utility script or custom automation', completed: false }
      ],
      resources: [
        { title: 'Python Programming Full Beginners Tutorial', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', type: 'video' },
        { title: 'LeetCode DSA Interactive Code Challenges', url: 'https://leetcode.com/', type: 'guide' }
      ]
    };
  }

  // Fallback subtasks based on selected Category
  if (category === 'Skill Development') {
    return {
      subtasks: [
        { id: 'st1', text: 'Set specific milestones for your practical learning trajectory', completed: false },
        { id: 'st2', text: 'Dedicate 5 hours to hands-on build projects or real-world practice', completed: false },
        { id: 'st3', text: 'Present your compiled work to peers or a mentor for active feedback', completed: false }
      ],
      resources: [
        { title: 'Learn Anything Faster - Spaced Repetition & Skill Drills', url: 'https://www.youtube.com/watch?v=5MgBikcWnYg', type: 'video' },
        { title: 'Ultralearning: Master Hard Skills Rapidly', url: 'https://www.scotthyoung.com/blog/ultralearning/', type: 'guide' }
      ]
    };
  }

  if (category === 'Career') {
    return {
      subtasks: [
        { id: 'st1', text: 'Tailor your professional resume, LinkedIn, and online portfolio', completed: false },
        { id: 'st2', text: 'Identify and apply to 3 internship or career roles matching your major', completed: false },
        { id: 'st3', text: 'Conduct a mock technical or behavioral interview practice session', completed: false }
      ],
      resources: [
        { title: 'How to Write a Resume That Stands Out', url: 'https://www.youtube.com/watch?v=xpAzY27j8E8', type: 'video' },
        { title: 'LinkedIn Profile Optimization Guide for Students', url: 'https://www.linkedin.com/help/linkedin/answer/a554229', type: 'guide' }
      ]
    };
  }

  if (category === 'Personal') {
    return {
      subtasks: [
        { id: 'st1', text: 'Establish a structured daily habit routine and log your progress', completed: false },
        { id: 'st2', text: 'Read 3 academic research articles or personal growth book chapters', completed: false },
        { id: 'st3', text: 'Reflect on your weekly achievements and note physical wellness/focus', completed: false }
      ],
      resources: [
        { title: 'Atomic Habits Summary - Tiny Changes, Remarkable Results', url: 'https://www.youtube.com/watch?v=PZ7lDrwYdZc', type: 'video' },
        { title: 'James Clear - How to Build a Better Habit', url: 'https://jamesclear.com/habits', type: 'guide' }
      ]
    };
  }

  // Academic or general default
  return {
    subtasks: [
      { id: 'st1', text: 'Draft well-structured summary study notes for core definitions', completed: false },
      { id: 'st2', text: 'Watch 2 deep-dive explanation lectures or video guides online', completed: false },
      { id: 'st3', text: 'Complete 10 active-recall flashcard questions or practice test', completed: false }
    ],
    resources: [
      { title: 'Ali Abdaal - Scientific Study Tips & Active Recall', url: 'https://www.youtube.com/watch?v=ukLnPbIffxE', type: 'video' },
      { title: 'Richard Feynman Learning Method Guide', url: 'https://fs.blog/feynman-technique/', type: 'guide' }
    ]
  };
};

// Quiz database mapped to all study fields
const getQuizForGoal = (title) => {
  const query = title.toLowerCase();

  // 1. Data Science & Machine Learning
  if (query.includes('ml') || query.includes('machine learning') || query.includes('ai') || query.includes('data science') || query.includes('intelligence')) {
    return [
      {
        question: "What is the primary goal of supervised machine learning?",
        options: [
          "Predicting output labels from labeled training dataset",
          "Clustering unlabeled data points based on features",
          "Maximizing strategic rewards dynamically in games",
          "Reducing dimensionality of raw database columns"
        ],
        answer: 0
      },
      {
        question: "In model evaluation, what does high Precision mean?",
        options: [
          "Few false positives among predicted positives",
          "Few false negatives among actual positives",
          "The training and compilation steps are fast",
          "The predictive model fits 100% of all data perfectly"
        ],
        answer: 0
      },
      {
        question: "Which algorithm splits data nodes based on information gain?",
        options: [
          "Linear Regression classifier",
          "Decision Trees classifier",
          "K-Means Clustering model",
          "Support Vector Machines"
        ],
        answer: 1
      }
    ];
  }

  // 2. Physics
  if (query.includes('physics') || query.includes('mechanics') || query.includes('quantum') || query.includes('electromagnetism') || query.includes('thermodynamics')) {
    return [
      {
        question: "What is Newton's Second Law of Motion?",
        options: ["F = ma", "E = mc²", "PV = nRT", "v = d/t"],
        answer: 0
      },
      {
        question: "Which particles are located inside the nucleus of an atom?",
        options: ["Electrons and Protons", "Protons and Neutrons", "Electrons and Neutrons", "Photons only"],
        answer: 1
      }
    ];
  }

  // 3. Chemistry
  if (query.includes('chem') || query.includes('chemistry') || query.includes('organic') || query.includes('stoichiometry') || query.includes('molecular')) {
    return [
      {
        question: "What is the molecular geometry of a methane molecule (CH₄)?",
        options: ["Linear shape", "Trigonal planar shape", "Tetrahedral shape", "Octahedral shape"],
        answer: 2
      },
      {
        question: "Which chemical bond involves the sharing of electron pairs between atoms?",
        options: ["Ionic bond", "Covalent bond", "Hydrogen bond", "Metallic bond"],
        answer: 1
      }
    ];
  }

  // 4. Biology
  if (query.includes('bio') || query.includes('biology') || query.includes('cellular') || query.includes('genetics') || query.includes('ecosystem')) {
    return [
      {
        question: "Which cellular organelle is responsible for generating chemical ATP energy?",
        options: ["Nucleus center", "Mitochondria powerhouse", "Ribosome site", "Endoplasmic Reticulum"],
        answer: 1
      },
      {
        question: "What is the primary function of the DNA Polymerase enzyme?",
        options: [
          "Synthesizing messenger RNA from DNA templates",
          "Synthesizing a new DNA strand by matching base pairs",
          "Translating active proteins at molecular ribosomes",
          "Splitting cellular outer membranes during fission"
        ],
        answer: 1
      }
    ];
  }

  // 5. English / Literature
  if (query.includes('english') || query.includes('literature') || query.includes('essay') || query.includes('writing') || query.includes('grammar')) {
    return [
      {
        question: "What does the term 'metaphor' represent in rhetorical literature?",
        options: [
          "Direct comparison between items using 'like' or 'as'",
          "Indirect comparison equating one distinct thing to another",
          "Constant repetition of initial consonant letter sounds",
          "Exaggerated verbal statements not meant to be taken literally"
        ],
        answer: 1
      },
      {
        question: "What is the primary objective of an argumentative thesis statement?",
        options: [
          "Summarizing the books chronologically",
          "Presenting a clear, debatable claim to be proved with evidence",
          "Asking an open rhetorical question to the reading audience",
          "Listing the bibliography reference materials at the end"
        ],
        answer: 1
      }
    ];
  }

  // 6. History
  if (query.includes('history') || query.includes('revolution') || query.includes('war') || query.includes('civilization') || query.includes('treaty')) {
    return [
      {
        question: "Which geopolitical event triggered the official beginning of World War I?",
        options: [
          "The signing of the Treaty of Versailles",
          "The assassination of Archduke Franz Ferdinand",
          "The storming of the Bastille in Paris",
          "The declaration of the United Nations charter"
        ],
        answer: 1
      },
      {
        question: "In which year did the United States sign the Declaration of Independence?",
        options: ["Year 1789", "Year 1776", "Year 1812", "Year 1865"],
        answer: 1
      }
    ];
  }

  // 7. Economics
  if (query.includes('eco') || query.includes('economics') || query.includes('finance') || query.includes('macro') || query.includes('micro')) {
    return [
      {
        question: "What does the Economic Law of Demand state, ceteris paribus?",
        options: [
          "As product price rises, quantity demanded rises",
          "As product price rises, quantity demanded falls",
          "As product price falls, overall supply levels rise",
          "Product unit cost does not affect buying quantity"
        ],
        answer: 1
      },
      {
        question: "Which monetary policy tool is directly controlled by federal central banks?",
        options: [
          "Determining income tax rates across citizens",
          "Adjusting benchmark interest rates & reserve ratios",
          "Setting maximum retail price ceilings on wheat",
          "Defining corporate trade import tariff amounts"
        ],
        answer: 1
      }
    ];
  }

  // 8. Geography
  if (query.includes('geo') || query.includes('geography') || query.includes('climate') || query.includes('demographics') || query.includes('cartography')) {
    return [
      {
        question: "Which major geological layer of the Earth lies directly underneath the crust?",
        options: ["Inner Core zone", "Mantle layer", "Outer Core fluid", "Lithosphere cap"],
        answer: 1
      },
      {
        question: "What does a cartographic topographic map explicitly show?",
        options: [
          "Global political country divisions and borders",
          "Physical land elevation changes using contour lines",
          "Average annual atmospheric precipitation quantities",
          "Tectonic ocean floor magnetic polarization profiles"
        ],
        answer: 1
      }
    ];
  }

  // 9. Mechanical Engineering
  if (query.includes('mechanical') || query.includes('mech') || query.includes('engineering statics') || query.includes('cad') || query.includes('solidworks')) {
    return [
      {
        question: "What physical metric does the Young's Modulus of a structural material measure?",
        options: [
          "Rate of heat transfer and thermal expansion",
          "Stiffness and elastic deformation stress resistance",
          "Ultimate plastic fracture strain toughness",
          "Dynamic fluid molecular viscosity index values"
        ],
        answer: 1
      },
      {
        question: "Which thermodynamics cycle serves as the ideal model for gas turbine power engines?",
        options: ["Carnot heat cycle", "Brayton gas cycle", "Rankine steam cycle", "Diesel pressure cycle"],
        answer: 1
      }
    ];
  }

  // 10. Electrical Engineering
  if (query.includes('electrical') || query.includes('circuit') || query.includes('ee') || query.includes('amplifier') || query.includes('op-amp')) {
    return [
      {
        question: "What does Kirchhoff's Current Law (KCL) state about active circuit junctions?",
        options: [
          "Electric voltage drops across the node sum to zero",
          "Total current entering a node matches total current leaving it",
          "Circuit current is inversely proportional to resistance",
          "Dissipated thermal power at the junction is maximized"
        ],
        answer: 1
      },
      {
        question: "What are the characteristics of an Ideal Operational Amplifier (Op-Amp)?",
        options: [
          "Zero input impedance and infinite output impedance",
          "Infinite input impedance and zero output impedance",
          "Infinite voltage amplification gain and infinite output impedance",
          "Zero voltage amplification gain and zero input impedance"
        ],
        answer: 1
      }
    ];
  }

  // 11. Mathematics / Calculus
  if (query.includes('calculus') || query.includes('math') || query.includes('algebra') || query.includes('geometry') || query.includes('stats') || query.includes('statistics')) {
    return [
      {
        question: "What is the derivative of f(x) = x³ with respect to x?",
        options: ["3x²", "x²", "3x", "1/3 x⁴"],
        answer: 0
      },
      {
        question: "What is the core purpose of integration in calculus?",
        options: [
          "Finding the instantaneous rate of change",
          "Finding the total area under a continuous curve",
          "Determining complex roots of algebraic equations",
          "Mapping multi-dimensional vector points"
        ],
        answer: 1
      }
    ];
  }

  // 12. Web Development / React
  if (query.includes('web') || query.includes('react') || query.includes('js') || query.includes('javascript') || query.includes('frontend') || query.includes('html') || query.includes('css') || query.includes('node')) {
    return [
      {
        question: "Which React hook is used to perform side effects in functional components?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        answer: 1
      },
      {
        question: "What is the correct way to pass data down a deep tree without props drilling?",
        options: [
          "Using React Context API Providers",
          "Declaring nested redundant state hooks",
          "Passing parameters manually on every stage",
          "Injecting globally styled CSS variables"
        ],
        answer: 0
      }
    ];
  }

  // 13. Computer Science / Programming / DSA
  if (query.includes('computer science') || query.includes('cs') || query.includes('python') || query.includes('coding') || query.includes('programming') || query.includes('java') || query.includes('c++') || query.includes('dsa') || query.includes('algorithms')) {
    return [
      {
        question: "Which data structure operates strictly on a First-In, First-Out (FIFO) basis?",
        options: ["Stack structure", "Queue structure", "Binary Search Tree", "Max Heap"],
        answer: 1
      },
      {
        question: "What is the search time complexity in a perfectly balanced Binary Search Tree?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answer: 1
      }
    ];
  }

  // Default general mastery quiz
  return [
    {
      question: "What is the core step of the Feynman Learning Method?",
      options: [
        "Write detailed research reports using complex jargon",
        "Explain the topic in extremely simple terms to a layperson",
        "Memorize textbook paragraphs verbatim with high speed",
        "Take multiple formal closed-book standardized tests"
      ],
      answer: 1
    },
    {
      question: "How does Active Recall differ from passive review methods?",
      options: [
        "Retrieving answers from memory rather than re-reading notes",
        "Highlighting sentences using bright colored pens",
        "Reading study material at high speeds repeatedly",
        "Listening to classical study soundscapes in background"
      ],
      answer: 0
    }
  ];
};

const Goals = () => {
  const { user } = useAuth();
  
  // Persistent local state loaded directly from localStorage
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('apais_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'Academic'
  });

  // Quiz Modal State
  const [quizGoal, setQuizGoal] = useState(null); // The goal currently being tested
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Sync back to localStorage on goals state change
  useEffect(() => {
    localStorage.setItem('apais_goals', JSON.stringify(goals));
  }, [goals]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    // Generate specific subtasks and study resources based on Title/Category
    const { subtasks, resources } = generateSubtasksAndResources(newGoal.title, newGoal.category);

    const createdGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      progress: 0, // Starts at 0%
      subtasks,
      resources,
      quizPassed: false,
      createdAt: new Date().toISOString()
    };

    setGoals([createdGoal, ...goals]);
    setNewGoal({ title: '', description: '', targetDate: '', category: 'Academic' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this academic goal?')) {
      setGoals(goals.filter(g => g.id !== id));
      if (quizGoal && quizGoal.id === id) {
        closeQuiz();
      }
    }
  };

  // Toggle dynamic subtask completion & recalculate goal percentage
  const handleToggleSubtask = (goalId, subtaskId) => {
    setGoals(prevGoals => prevGoals.map(g => {
      if (g.id !== goalId) return g;
      const updatedTasks = g.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      const completedCount = updatedTasks.filter(st => st.completed).length;
      const pct = Math.round((completedCount / updatedTasks.length) * 100);
      return {
        ...g,
        subtasks: updatedTasks,
        progress: pct
      };
    }));
  };

  // Bulk set all subtasks completed (100% progress)
  const handleComplete = (id) => {
    setGoals(goals.map(g => {
      if (g.id !== id) return g;
      const updatedTasks = g.subtasks.map(st => ({ ...st, completed: true }));
      return { ...g, subtasks: updatedTasks, progress: 100 };
    }));
  };

  // Mastery Quiz trigger
  const startQuiz = (goal) => {
    const questions = getQuizForGoal(goal.title);
    setQuizGoal(goal);
    setQuizQuestions(questions);
    setCurrentQ(0);
    setSelectedOpt(null);
    setQuizFinished(false);
    setQuizScore(0);
  };

  const handleAnswerSubmit = () => {
    if (selectedOpt === null) return;
    const isCorrect = selectedOpt === quizQuestions[currentQ].answer;
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    setQuizScore(newScore);

    if (currentQ + 1 < quizQuestions.length) {
      setCurrentQ(currentQ + 1);
      setSelectedOpt(null);
    } else {
      setQuizFinished(true);
      // If score is perfect, unlock Mastery badge for the goal
      if (newScore === quizQuestions.length) {
        setGoals(prev => prev.map(g => {
          if (g.id !== quizGoal.id) return g;
          return { ...g, quizPassed: true };
        }));
      }
    }
  };

  const closeQuiz = () => {
    setQuizGoal(null);
    setQuizQuestions([]);
    setCurrentQ(0);
    setSelectedOpt(null);
    setQuizFinished(false);
    setQuizScore(0);
  };

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.progress === 100).length,
    mastered: goals.filter(g => g.quizPassed).length
  };

  return (
    <div className="goals-container fade-in">
      <div className="page-header-row">
        <div className="header-text-block">
          <h1>🎯 Goal Optimization</h1>
          <p>Set objectives, complete academic tasks, and challenge yourself with Mastery Quizzes to earn badges.</p>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--primary">🎯</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.total}</div>
            <div className="kpi-label">Active Goals</div>
          </div>
        </div>
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--success">🏆</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.completed}</div>
            <div className="kpi-label">Goals Completed</div>
          </div>
        </div>
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--warning">🎓</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.mastered}</div>
            <div className="kpi-label">Mastered Badges</div>
          </div>
        </div>
      </div>

      <div className="content-split-layout">
        
        {/* Left Side: Goal Entry Form */}
        <div className="form-panel-side">
          <div className="glass-panel">
            <h2>✨ Define New Goal</h2>
            <p className="panel-subtitle">Create an academic goal to automatically generate subtasks, resources, and custom mastery quizzes.</p>
            
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text" name="title"
                  value={newGoal.title} onChange={handleChange}
                  required placeholder="e.g. Study ML / Prepare Calculus"
                />
              </div>
              
              <div className="form-group">
                <label>Description & Strategy</label>
                <textarea
                  name="description" rows="2"
                  value={newGoal.description} onChange={handleChange}
                  placeholder="Detail your study execution strategy here..."
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date" name="targetDate"
                    value={newGoal.targetDate} onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={newGoal.category} onChange={handleChange}>
                    <option value="Academic">Academic</option>
                    <option value="Skill Development">Skill Development</option>
                    <option value="Career">Career & Internships</option>
                    <option value="Personal">Personal Growth</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary submit-btn-full">
                Launch Goal 🚀
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Goals Board */}
        <div className="display-panel-side">
          <div className="board-header">
            <h2>Your Active Objectives</h2>
          </div>
          
          {goals.length > 0 ? (
            <div className="cards-grid">
              {goals.map((goal, idx) => {
                const isNear = new Date(goal.targetDate) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
                return (
                  <div className={`premium-card goal-card ${goal.quizPassed ? 'goal-mastered-glow' : ''}`} key={goal.id} style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="card-header">
                      <span className="category-tag">{goal.category}</span>
                      {goal.quizPassed && <span className="mastery-gold-badge">🏆 MASTERED</span>}
                      <button className="delete-icon-btn" onClick={() => handleDelete(goal.id)} title="Remove">✕</button>
                    </div>
                    
                    <h3 className="card-title">{goal.title}</h3>
                    {goal.description && <p className="card-desc">{goal.description}</p>}
                    
                    {/* Dynamic Sub-Tasks Checklist */}
                    {goal.subtasks && goal.subtasks.length > 0 && (
                      <div className="goal-subtasks-section">
                        <h4>📝 Guided Steps</h4>
                        <div className="goal-subtasks-list">
                          {goal.subtasks.map(st => (
                            <label key={st.id} className={`goal-subtask-item ${st.completed ? 'completed' : ''}`}>
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => handleToggleSubtask(goal.id, st.id)}
                              />
                              <span className="subtask-text">{st.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Study Resources */}
                    {goal.resources && goal.resources.length > 0 && (
                      <div className="goal-resources-section">
                        <h4>💡 Study References</h4>
                        <div className="goal-resources-list">
                          {goal.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="goal-resource-link"
                            >
                              {res.type === 'video' ? '📺' : '📖'} {res.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mastery Quiz Status Badge / Button */}
                    {goal.progress === 100 && (
                      <div className="mastery-quiz-card-prompt">
                        {goal.quizPassed ? (
                          <div className="quiz-passed-banner">
                            <span>🎓 Mastery Check Passed! 100% Score</span>
                          </div>
                        ) : (
                          <button className="btn-accent mastery-quiz-start-btn" onClick={() => startQuiz(goal)}>
                            🎓 Take Mastery Quiz
                          </button>
                        )}
                      </div>
                    )}

                    <div className="card-progress-section">
                      <div className="progress-labels">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${goal.progress}%`,
                            background: goal.progress === 100 ? '#10b981' : 'var(--primary-color)'
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className={`date-badge ${isNear && goal.progress < 100 ? 'urgent' : ''}`}>
                        📅 {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {goal.progress < 100 ? (
                        <button className="btn-secondary btn-sm" onClick={() => handleComplete(goal.id)}>Complete</button>
                      ) : !goal.quizPassed ? (
                        <button className="btn-primary btn-sm" onClick={() => startQuiz(goal)}>Quiz</button>
                      ) : (
                        <span className="status-badge status-completed">COMPLETED</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-panel glassmorphism">
              <span className="empty-icon">🏔️</span>
              <h3>No academic objectives set yet</h3>
              <p>Define a goal on the left to generate checklists, learning references, and Mastery Quizzes.</p>
            </div>
          )}
        </div>

      </div>

      {/* ─── MASTERY QUIZ MODAL ─── */}
      {quizGoal && (
        <div className="premium-quiz-modal-overlay">
          <div className="premium-quiz-modal-content glassmorphism">
            <div className="quiz-modal-header">
              <h2>🎓 Mastery Check: {quizGoal.title}</h2>
              <button className="close-quiz-btn" onClick={closeQuiz}>✕</button>
            </div>

            {!quizFinished ? (
              <div className="quiz-active-body">
                <div className="quiz-progress-header">
                  <span>Question {currentQ + 1} of {quizQuestions.length}</span>
                  <div className="quiz-progress-bar">
                    <div className="quiz-progress-fill" style={{ width: `${((currentQ) / quizQuestions.length) * 100}%` }}></div>
                  </div>
                </div>

                <h3 className="quiz-question-text">{quizQuestions[currentQ]?.question}</h3>

                <div className="quiz-options-list">
                  {quizQuestions[currentQ]?.options.map((opt, oIdx) => (
                    <label key={oIdx} className={`quiz-option-item ${selectedOpt === oIdx ? 'selected' : ''}`}>
                      <input
                        type="radio" name="quiz-options"
                        checked={selectedOpt === oIdx}
                        onChange={() => setSelectedOpt(oIdx)}
                        style={{ display: 'none' }}
                      />
                      <span className="quiz-option-dot"></span>
                      <span className="quiz-option-text">{opt}</span>
                    </label>
                  ))}
                </div>

                <div className="quiz-action-footer">
                  <button className="btn-secondary" onClick={closeQuiz}>Abandon</button>
                  <button className="btn-primary" onClick={handleAnswerSubmit} disabled={selectedOpt === null}>
                    {currentQ + 1 === quizQuestions.length ? 'Finish Quiz' : 'Next Question ➔'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="quiz-result-body">
                {quizScore === quizQuestions.length ? (
                  <div className="quiz-victory-block">
                    <span className="victory-crown">🏆</span>
                    <h2>Goal Mastered!</h2>
                    <p>Perfect Score! You got **{quizScore}/{quizQuestions.length}** correct answers. You have officially mastered your objectives and unlocked the Mastery badge!</p>
                    <button className="btn-success" onClick={closeQuiz}>Fantastic!</button>
                  </div>
                ) : (
                  <div className="quiz-failure-block">
                    <span className="failure-emoji">📚</span>
                    <h2>Keep Learning!</h2>
                    <p>You scored **{quizScore}/{quizQuestions.length}** correct answers. We recommend reviewing your educational references and trying the quiz again to unlock the badge!</p>
                    <div className="quiz-failure-actions">
                      <button className="btn-secondary" onClick={closeQuiz}>Close</button>
                      <button className="btn-primary" onClick={() => startQuiz(quizGoal)}>Try Again 🔄</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;