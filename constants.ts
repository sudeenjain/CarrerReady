import { SkillLevel, SkillPriority, JobRole, JobOpening, UserProfile } from './types';

export const SAMPLE_JOBS: JobOpening[] = [
  // --- AMAZON CLUSTER ---
  {
    id: 'amazon-1',
    title: 'UI Developer (L5)',
    company: 'Amazon',
    location: 'Bangalore',
    salaryRange: '₹28L - ₹45L',
    minSalary: 28,
    rating: 4.5,
    requiredSkills: [
      { name: 'React', minLevel: SkillLevel.ADVANCED },
      { name: 'Tailwind CSS', minLevel: SkillLevel.ADVANCED },
      { name: 'TypeScript', minLevel: SkillLevel.INTERMEDIATE }
    ],
    applyUrl: 'https://amazon.jobs/en/jobs/sample-1',
    source: 'Company',
    postedDate: '1 day ago',
    tier: 'Best Match'
  },
  {
    id: 'amazon-2',
    title: 'Backend Engineer (SDE II)',
    company: 'Amazon',
    location: 'Hyderabad',
    salaryRange: '₹35L - ₹55L',
    minSalary: 35,
    rating: 4.5,
    requiredSkills: [
      { name: 'Node.js', minLevel: SkillLevel.ADVANCED },
      { name: 'SQL (PostgreSQL)', minLevel: SkillLevel.ADVANCED },
      { name: 'System Design', minLevel: SkillLevel.INTERMEDIATE }
    ],
    applyUrl: 'https://amazon.jobs/en/jobs/sample-2',
    source: 'LinkedIn',
    postedDate: '3 days ago',
    tier: 'Skill Gap'
  },
  {
    id: 'amazon-3',
    title: 'Data Analyst (Retail)',
    company: 'Amazon',
    location: 'Remote',
    salaryRange: '₹18L - ₹25L',
    minSalary: 18,
    rating: 4.5,
    requiredSkills: [
      { name: 'SQL', minLevel: SkillLevel.ADVANCED },
      { name: 'Python', minLevel: SkillLevel.INTERMEDIATE },
      { name: 'Communication', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://amazon.jobs/en/jobs/sample-3',
    source: 'Indeed',
    postedDate: 'Today',
    tier: 'Best Match'
  },
  {
    id: 'amazon-4',
    title: 'Applied Scientist (AI)',
    company: 'Amazon',
    location: 'Bangalore',
    salaryRange: '₹40L - ₹75L',
    minSalary: 40,
    rating: 4.5,
    requiredSkills: [
      { name: 'Python', minLevel: SkillLevel.ADVANCED },
      { name: 'Algorithm Design', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://amazon.jobs/en/jobs/sample-4',
    source: 'Company',
    postedDate: '2 days ago',
    tier: 'Stretch'
  },

  // --- ZOMATO CLUSTER ---
  {
    id: 'zomato-1',
    title: 'Technical Lead',
    company: 'Zomato',
    location: 'Gurgaon',
    salaryRange: '₹45L - ₹75L',
    minSalary: 45,
    rating: 4.2,
    requiredSkills: [
      { name: 'Next.js', minLevel: SkillLevel.ADVANCED },
      { name: 'Node.js', minLevel: SkillLevel.ADVANCED },
      { name: 'System Design', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://zomato.com/careers',
    source: 'Company',
    postedDate: 'Today',
    tier: 'Stretch'
  },
  {
    id: 'zomato-2',
    title: 'Marketing Analyst',
    company: 'Zomato',
    location: 'Gurgaon',
    salaryRange: '₹12L - ₹20L',
    minSalary: 12,
    rating: 4.2,
    requiredSkills: [
      { name: 'Communication', minLevel: SkillLevel.ADVANCED },
      { name: 'Problem Solving', minLevel: SkillLevel.INTERMEDIATE }
    ],
    applyUrl: 'https://zomato.com/careers',
    source: 'Wellfound',
    postedDate: '2 days ago',
    tier: 'Best Match'
  },
  {
    id: 'zomato-3',
    title: 'Operations Manager',
    company: 'Zomato',
    location: 'Bangalore',
    salaryRange: '₹15L - ₹28L',
    minSalary: 15,
    rating: 4.2,
    requiredSkills: [
      { name: 'Teamwork', minLevel: SkillLevel.ADVANCED },
      { name: 'Problem Solving', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://zomato.com/careers',
    source: 'Company',
    postedDate: '5 days ago',
    tier: 'Best Match'
  },
  {
    id: 'zomato-4',
    title: 'Frontend Engineer (Blinkit)',
    company: 'Zomato',
    location: 'Gurgaon',
    salaryRange: '₹22L - ₹38L',
    minSalary: 22,
    rating: 4.1,
    requiredSkills: [
      { name: 'React', minLevel: SkillLevel.ADVANCED },
      { name: 'JavaScript', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://zomato.com/careers',
    source: 'LinkedIn',
    postedDate: '1 day ago',
    tier: 'Best Match'
  },

  // --- GOOGLE & MICROSOFT ---
  {
    id: 'google-1',
    title: 'Staff Software Engineer',
    company: 'Google',
    location: 'Bangalore',
    salaryRange: '₹60L - ₹1.2Cr',
    minSalary: 60,
    rating: 4.8,
    requiredSkills: [
      { name: 'JavaScript', minLevel: SkillLevel.ADVANCED },
      { name: 'System Design', minLevel: SkillLevel.ADVANCED },
      { name: 'Algorithm Design', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://google.com/careers',
    source: 'Company',
    postedDate: '1 week ago',
    tier: 'Stretch'
  },
  {
    id: 'google-2',
    title: 'Product Manager',
    company: 'Google',
    location: 'Hyderabad',
    salaryRange: '₹35L - ₹55L',
    minSalary: 35,
    rating: 4.8,
    requiredSkills: [
      { name: 'Communication', minLevel: SkillLevel.ADVANCED },
      { name: 'Problem Solving', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://google.com/careers',
    source: 'Company',
    postedDate: '3 days ago',
    tier: 'Best Match'
  },
  {
    id: 'msft-1',
    title: 'Cloud Architect (Azure)',
    company: 'Microsoft',
    location: 'Hyderabad',
    salaryRange: '₹40L - ₹65L',
    minSalary: 40,
    rating: 4.6,
    requiredSkills: [
      { name: 'Docker', minLevel: SkillLevel.ADVANCED },
      { name: 'System Design', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://microsoft.com/careers',
    source: 'LinkedIn',
    postedDate: '2 days ago',
    tier: 'Skill Gap'
  },
  {
    id: 'msft-2',
    title: 'Security Researcher',
    company: 'Microsoft',
    location: 'Bangalore',
    salaryRange: '₹30L - ₹50L',
    minSalary: 30,
    rating: 4.6,
    requiredSkills: [
      { name: 'Problem Solving', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://microsoft.com/careers',
    source: 'Indeed',
    postedDate: '5 days ago',
    tier: 'Skill Gap'
  },

  // --- SWIGGY & ZEPTO ---
  {
    id: 'zepto-1',
    title: 'Senior Frontend Engineer',
    company: 'Zepto',
    location: 'Mumbai',
    salaryRange: '₹30L - ₹45L',
    minSalary: 30,
    rating: 4.0,
    requiredSkills: [
      { name: 'React', minLevel: SkillLevel.ADVANCED },
      { name: 'Next.js', minLevel: SkillLevel.ADVANCED },
      { name: 'Tailwind CSS', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://zepto.com/careers',
    source: 'Wellfound',
    postedDate: 'Today',
    tier: 'Best Match'
  },
  {
    id: 'swiggy-1',
    title: 'Product Designer (UI/UX)',
    company: 'Swiggy',
    location: 'Bangalore',
    salaryRange: '₹18L - ₹32L',
    minSalary: 18,
    rating: 4.3,
    requiredSkills: [
      { name: 'HTML/CSS', minLevel: SkillLevel.ADVANCED },
      { name: 'Tailwind CSS', minLevel: SkillLevel.INTERMEDIATE },
      { name: 'Communication', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://swiggy.com/careers',
    source: 'LinkedIn',
    postedDate: '4 days ago',
    tier: 'Best Match'
  },
  {
    id: 'swiggy-2',
    title: 'Lead Backend Engineer',
    company: 'Swiggy',
    location: 'Bangalore',
    salaryRange: '₹35L - ₹60L',
    minSalary: 35,
    rating: 4.3,
    requiredSkills: [
      { name: 'Node.js', minLevel: SkillLevel.ADVANCED },
      { name: 'System Design', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://swiggy.com/careers',
    source: 'Company',
    postedDate: 'Today',
    tier: 'Stretch'
  },

  // --- FINTECH ---
  {
    id: 'paytm-1',
    title: 'Security Engineer',
    company: 'Paytm',
    location: 'Noida',
    salaryRange: '₹28L - ₹48L',
    minSalary: 28,
    rating: 3.9,
    requiredSkills: [
      { name: 'Node.js', minLevel: SkillLevel.ADVANCED },
      { name: 'System Design', minLevel: SkillLevel.INTERMEDIATE }
    ],
    applyUrl: 'https://paytm.com/careers',
    source: 'Company',
    postedDate: 'Today',
    tier: 'Skill Gap'
  },
  {
    id: 'razorpay-1',
    title: 'Merchant Growth Lead',
    company: 'Razorpay',
    location: 'Bangalore',
    salaryRange: '₹22L - ₹35L',
    minSalary: 22,
    rating: 4.4,
    requiredSkills: [
      { name: 'Communication', minLevel: SkillLevel.ADVANCED },
      { name: 'Problem Solving', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://razorpay.com/careers',
    source: 'LinkedIn',
    postedDate: '3 days ago',
    tier: 'Best Match'
  },
  {
    id: 'cred-1',
    title: 'Backend Scalability Engineer',
    company: 'CRED',
    location: 'Bangalore',
    salaryRange: '₹35L - ₹55L',
    minSalary: 35,
    rating: 4.6,
    requiredSkills: [
      { name: 'Node.js', minLevel: SkillLevel.ADVANCED },
      { name: 'System Design', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://cred.club/careers',
    source: 'Wellfound',
    postedDate: '1 day ago',
    tier: 'Skill Gap'
  },

  // --- NEW BENCHMARK JOBS ---
  {
    id: 'meta-1',
    title: 'Full Stack Engineer',
    company: 'Meta',
    location: 'Remote',
    salaryRange: '₹45L - ₹85L',
    minSalary: 45,
    rating: 4.7,
    requiredSkills: [
      { name: 'React', minLevel: SkillLevel.ADVANCED },
      { name: 'Node.js', minLevel: SkillLevel.INTERMEDIATE },
      { name: 'SQL', minLevel: SkillLevel.INTERMEDIATE }
    ],
    applyUrl: 'https://meta.com/careers',
    source: 'Company',
    postedDate: '2 days ago',
    tier: 'Best Match'
  },
  {
    id: 'netflix-2',
    title: 'Senior Data Scientist',
    company: 'Netflix',
    location: 'Los Gatos',
    salaryRange: '₹1.2Cr - ₹2.5Cr',
    minSalary: 120,
    rating: 4.9,
    requiredSkills: [
      { name: 'Python', minLevel: SkillLevel.ADVANCED },
      { name: 'Machine Learning', minLevel: SkillLevel.ADVANCED },
      { name: 'Statistics', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://netflix.com/jobs',
    source: 'Company',
    postedDate: '1 day ago',
    tier: 'Stretch'
  },
  {
    id: 'uber-2',
    title: 'DevOps Architect',
    company: 'Uber',
    location: 'Bangalore',
    salaryRange: '₹40L - ₹70L',
    minSalary: 40,
    rating: 4.3,
    requiredSkills: [
      { name: 'Docker', minLevel: SkillLevel.ADVANCED },
      { name: 'Kubernetes', minLevel: SkillLevel.ADVANCED },
      { name: 'CI/CD', minLevel: SkillLevel.ADVANCED }
    ],
    applyUrl: 'https://uber.com/careers',
    source: 'LinkedIn',
    postedDate: 'Today',
    tier: 'Skill Gap'
  },
  {
    id: 'spotify-1',
    title: 'iOS Developer',
    company: 'Spotify',
    location: 'Stockholm',
    salaryRange: '₹50L - ₹90L',
    minSalary: 50,
    rating: 4.6,
    requiredSkills: [
      { name: 'Swift', minLevel: SkillLevel.ADVANCED },
      { name: 'Mobile UI Design', minLevel: SkillLevel.INTERMEDIATE }
    ],
    applyUrl: 'https://spotify.com/careers',
    source: 'Company',
    postedDate: '3 days ago',
    tier: 'Best Match'
  }
];

export const JOB_ROLES: JobRole[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Specializes in creating user-facing interfaces using modern web technologies.',
    requirements: [
      { skillName: 'React', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'TypeScript', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.CRITICAL, weight: 0.15 },
      { skillName: 'Tailwind CSS', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.1 },
      { skillName: 'HTML/CSS', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.1 },
      { skillName: 'JavaScript', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.15 },
      { skillName: 'Communication', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.1 },
      { skillName: 'Git', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.05 },
      { skillName: 'Teamwork', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.05 },
      { skillName: 'Next.js', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.1 },
    ]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Focuses on server-side logic, database management, and API design.',
    requirements: [
      { skillName: 'Node.js', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'Express', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.15 },
      { skillName: 'MongoDB', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.CRITICAL, weight: 0.15 },
      { skillName: 'SQL (PostgreSQL)', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.1 },
      { skillName: 'Problem Solving', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.15 },
      { skillName: 'Docker', minLevel: SkillLevel.BASIC, priority: SkillPriority.IMPORTANT, weight: 0.1 },
      { skillName: 'System Design', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.CRITICAL, weight: 0.15 },
      { skillName: 'REST APIs', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.1 },
    ]
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    description: 'Versatile engineer capable of handling both frontend and backend development.',
    requirements: [
      { skillName: 'React', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'Node.js', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'SQL', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.15 },
      { skillName: 'TypeScript', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.CRITICAL, weight: 0.15 },
      { skillName: 'System Design', minLevel: SkillLevel.BASIC, priority: SkillPriority.IMPORTANT, weight: 0.15 },
      { skillName: 'Communication', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.15 },
    ]
  },
  {
    id: 'datascientist',
    title: 'Data Scientist',
    description: 'Extracts insights from data using statistical methods and machine learning.',
    requirements: [
      { skillName: 'Python', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.25 },
      { skillName: 'SQL', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'Machine Learning', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'Statistics', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.IMPORTANT, weight: 0.15 },
      { skillName: 'Data Visualization', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.1 },
      { skillName: 'Communication', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.1 },
    ]
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    description: 'Bridges the gap between development and operations through automation and infrastructure.',
    requirements: [
      { skillName: 'Docker', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'Kubernetes', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'CI/CD', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'Linux', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.IMPORTANT, weight: 0.15 },
      { skillName: 'AWS/Azure', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.15 },
      { skillName: 'Python/Bash', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.1 },
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    description: 'Builds high-performance native or cross-platform mobile applications.',
    requirements: [
      { skillName: 'Swift', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.25 },
      { skillName: 'Mobile UI Design', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.2 },
      { skillName: 'API Integration', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
      { skillName: 'Git', minLevel: SkillLevel.INTERMEDIATE, priority: SkillPriority.IMPORTANT, weight: 0.15 },
      { skillName: 'Problem Solving', minLevel: SkillLevel.ADVANCED, priority: SkillPriority.CRITICAL, weight: 0.2 },
    ]
  }
];

export const INITIAL_USER: UserProfile = {
  name: 'Rajesh Kumar',
  email: 'rajesh@email.com',
  targetRole: 'Frontend Developer',
  currentSkills: [
    { name: 'JavaScript', level: SkillLevel.ADVANCED, category: 'Frontend', source: 'Resume' },
    { name: 'React', level: SkillLevel.INTERMEDIATE, category: 'Frontend', source: 'Resume' },
    { name: 'Node.js', level: SkillLevel.BASIC, category: 'Backend', source: 'Manual' },
    { name: 'Communication', level: SkillLevel.INTERMEDIATE, category: 'Soft Skill', source: 'Resume', isSoftSkill: true },
    { name: 'HTML/CSS', level: SkillLevel.ADVANCED, category: 'Frontend', source: 'Resume' },
    { name: 'Git', level: SkillLevel.INTERMEDIATE, category: 'Tools', source: 'GitHub' },
  ],
  projects: [
    { id: '1', name: 'E-commerce UI', description: 'Modern store front with Tailwind', techStack: ['React', 'Tailwind'], source: 'Manual' }
  ],
  readinessScore: 68,
  interviewReadiness: 72,
  streak: 1,
  history: [
    { date: '2024-03-01', score: 68 },
  ],
  applications: []
};