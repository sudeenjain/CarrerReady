
import { RoadmapStep, SkillLevel } from './types';

export class RuleBasedProvider {
  name = "Neural Safety Bridge (Local)";

  async generateRoadmap(skills: any, role: string): Promise<RoadmapStep[]> {
    console.log(`Generating Rule-Based Roadmap for ${role}...`);
    const roadmap: RoadmapStep[] = [];
    
    // Determine target based on role keywords
    const isFrontend = role.toLowerCase().includes('front');
    const isBackend = role.toLowerCase().includes('back');
    const isFullstack = role.toLowerCase().includes('full');
    const isData = role.toLowerCase().includes('data');

    const stack = isFrontend ? 'React' : isBackend ? 'Node.js' : isData ? 'Python' : 'JavaScript';

    for (let day = 1; day <= 40; day++) {
      let phase: "Foundation" | "Skill Building" | "Projects" | "Interview Readiness" = "Foundation";
      if (day > 30) phase = "Interview Readiness";
      else if (day > 15) phase = "Projects";
      else if (day > 7) phase = "Skill Building";

      const step: RoadmapStep = {
        day,
        phase,
        primaryGoal: this.getGoal(day, phase, stack),
        learningTask: this.getLearningTask(day, phase, stack),
        practiceTask: this.getPracticeTask(day, phase, stack),
        buildingTask: this.getBuildingTask(day, phase, stack),
        reviewTask: "Review key concepts and document learning in your dev journal.",
        expectedOutput: day > 15 ? "GitHub Commit & Live Demo Link" : "Working Code Snippets",
        timeEstimate: "3-5 Hours",
        milestone: day % 5 === 0 ? `Milestone ${day/5}: ${phase} Checkpoint` : "",
        youtubeVideoId: this.getVideo(day, phase, stack),
        resourceLinks: [{ label: "Official Documentation", url: "https://developer.mozilla.org" }],
        difficulty: day > 30 ? "Expert" : day > 15 ? "Advanced" : day > 7 ? "Intermediate" : "Beginner",
        points: 50 + (day * 2),
        interviewQuestions: day > 30 ? this.getInterviewQuestions(day, stack) : []
      };
      roadmap.push(step);
    }
    return roadmap;
  }

  private getGoal(day: number, phase: string, stack: string) {
    if (phase === "Foundation") return `Mastering ${stack} Core Concepts - Part ${day}`;
    if (phase === "Skill Building") return `Advanced ${stack} Patterns & Architecture`;
    if (phase === "Projects") return `Building Scalable ${stack} Applications`;
    return `Elite Interview Preparation & ${stack} System Design`;
  }

  private getLearningTask(day: number, phase: string, stack: string) {
    if (phase === "Foundation") return `Deep dive into ${stack} fundamentals, syntax, and basic workflows.`;
    if (phase === "Skill Building") return `Study state management, hooks, and performance optimization in ${stack}.`;
    if (phase === "Projects") return `Learn about REST APIs, Database schemas, and complex ${stack} integrations.`;
    return `Analyze high-level architecture and common ${stack} interview pitfalls.`;
  }

  private getPracticeTask(day: number, phase: string, stack: string) {
    if (phase === "Foundation") return `Solve 5 coding challenges using only ${stack}.`;
    if (phase === "Skill Building") return `Refactor an existing piece of code to use ${stack} best practices.`;
    if (phase === "Projects") return `Implement a complex feature like Authentication or Real-time updates.`;
    return `Conduct a mock interview and time your solutions.`;
  }

  private getBuildingTask(day: number, phase: string, stack: string) {
    if (phase === "Foundation") return `Build a small utility tool using ${stack}.`;
    if (phase === "Skill Building") return `Create a multi-page application with routing and validation.`;
    if (phase === "Projects") return `Commit Day ${day} progress to your main GitHub repository. Must push at least 50 lines of code.`;
    return `Build a portfolio-worthy demonstration of a complex algorithm.`;
  }

  private getVideo(day: number, phase: string, stack: string) {
    const collections: Record<string, string[]> = {
      'React': [
        'w7ejDZ8SWv8', 'Ke90Tje7VS0', 'hQAHWalADXQ', 'SqcY0GlETPk', 'bMknfKXIFA8',
        'yjG9Zz6S_nU', 'LDB4uaJp7fM', '00pSfyPRL6Y', 'u87-tN_77QY', 'N3AkSS5hXMA'
      ],
      'Node.js': [
        'Oe421EPjeBE', 'vJEO57B05Sg', '32M1al-Y6Ag', 'TnvZ5F7XNfE', 'fbY35S5L624',
        'X7W-X_4-yTM', 'H9M02of22z4', 'm55PTVUrlnA', 'G6L-G_XoY_Q', 'mR9B_SOfs2U'
      ],
      'Python': [
        'kqtD5dpn9C8', 'rfscVS0vtbw', '8DvywoWv6fI', 'm67-bOpOoPU', 't8pPdKy7m8I',
        'f79iNfFf_O4', 'Z1Yd7upQsXY', 'JJmC1M2AnS4', 'vLqTf2b6GZw', 'q8K_q-H922Y'
      ],
      'JavaScript': [
        'jS4aFq5-91M', 'hdI2bqOjy3c', '2jiXPKX4908', '8dWL3wWXVIQ', 'W6NZfCO5SIk',
        'lf9fS_W-GzY', 'L8L-N_O8lYk', 'UuX-yN6fMog', 'pkqT_I7pQyI', 'uH-vGIOO3S8'
      ]
    };
    
    const list = collections[stack] || collections['JavaScript'];
    return list[day % list.length];
  }

  private getInterviewQuestions(day: number, stack: string) {
    const questions = [
      `Explain the internal engine and performance characteristics of ${stack}.`,
      `How do you handle memory leaks and optimization in large-scale ${stack} apps?`,
      `Describe a time you solved a complex architectural bug in ${stack}.`,
      `What is your strategy for testing ${stack} applications at scale?`,
      `How does ${stack} handle concurrency and asynchronous data streams?`
    ];
    return [questions[day % questions.length], questions[(day + 1) % questions.length]];
  }
}
