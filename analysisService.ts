
import { GeminiProvider } from './geminiProvider';
import { RuleBasedProvider } from './ruleBasedProvider';
import { AnalysisProvider } from './analysisProvider';

class GroqProvider implements AnalysisProvider {
  name = "Groq AI Provider";

  private async fetchGroq(prompt: string, jsonMode = false) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
    if (!apiKey) throw new Error("Groq API Key missing");

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7,
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${res.status} - ${JSON.stringify(err)}`);
    }
    
    return await res.json();
  }

  async getMentorAdvice(history: any, profile: string) {
    const prompt = `You are an Elite AI System Architect and Career Strategist.
Advice for: ${profile}.
History: ${JSON.stringify(history)}
Rules: Use bold headers, bullet points, be professional and actionable. No fluff.`;

    const data = await this.fetchGroq(prompt);
    return data.choices?.[0]?.message?.content || "No advice available.";
  }

  async generateRoadmap(skills: any, role: string) {
    const prompt = `Generate a 40-day career roadmap for ${role} based on skills: ${JSON.stringify(skills)}.
    Respond ONLY with a JSON array of 40 objects. 
    Each object MUST follow this exact schema:
    {
      "day": number,
      "phase": "Foundation" | "Skill Building" | "Projects" | "Interview Readiness",
      "primaryGoal": string,
      "learningTask": string,
      "practiceTask": string,
      "buildingTask": string,
      "reviewTask": string,
      "expectedOutput": string,
      "timeEstimate": string,
      "milestone": string | null,
      "youtubeVideoId": string,
      "resourceLinks": [{"label": string, "url": string}],
      "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Expert",
      "points": number,
      "interviewQuestions": string[]
    }
    IMPORTANT: For Phase 1 (Days 1-7), videos must progress from Beginner to Advanced. For Phase 3, tasks must involve GitHub commits. For Phase 4, tasks must focus on interview prep and provide specific questions.`;

    const data = await this.fetchGroq(prompt, true);
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned empty roadmap data");
    
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.roadmap || parsed.steps || []);
  }

  private gemini = new GeminiProvider();
  async extractSkillsFromResume(text: string) { return this.gemini.extractSkillsFromResume(text); }
  async analyzeLinkedInProfile(text: string) { return this.gemini.analyzeLinkedInProfile(text); }
  async analyzeGitHubRepos(repos: any[], username?: string, userProfile?: any) {
    const repoData = repos.slice(0, 30).map(r => ({
      name: r.name,
      description: r.description || "No description provided",
      language: r.language || "Unknown",
      topics: r.topics || [],
      stars: r.stargazers_count || 0
    }));

    const prompt = `You are an Elite Technical Auditor. Analyze the GitHub profile for "${username || 'Unknown'}".
    ${userProfile ? `Profile: ${userProfile.name}, Bio: ${userProfile.bio}, Company: ${userProfile.company}` : ''}
    
    Data: ${JSON.stringify(repoData)}
    
    Respond strictly in JSON format:
    {
      "skills": [{"name": "string", "level": "Basic|Intermediate|Advanced", "category": "string"}],
      "topProjects": [{"name": "string", "description": "string", "techStack": ["string"]}]
    }
    Make sure to include the username "${username}" in the analysis details to prove identity verification.`;

    try {
      const data = await this.fetchGroq(prompt, true);
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq");
      const parsed = JSON.parse(content);
      
      return {
        skills: (parsed.skills || []).map((s: any) => ({ ...s, source: 'GitHub' as const, isSoftSkill: false, confidence: 0.95 })),
        projects: (parsed.topProjects || []).map((p: any) => ({ ...p, id: Math.random().toString(36).substr(2, 9), source: 'GitHub' as const }))
      };
    } catch (e) {
      console.warn("Groq fallback failed, using gemini", e);
      return this.gemini.analyzeGitHubRepos(repos, username, userProfile);
    }
  }
  async fetchLiveMarketPulse(role: string) { return this.gemini.fetchLiveMarketPulse(role); }
  async generateCoverLetter(resume: string, title: string, company: string) { return this.gemini.generateCoverLetter(resume, title, company); }
  async getWinningStrategy(title: string, company: string, skills: string[]) { return this.gemini.getWinningStrategy(title, company, skills); }
  async getJobBenchmark(jobTitle: string, company: string, requirements: any[], userSkills: any[]) { return this.gemini.getJobBenchmark(jobTitle, company, requirements, userSkills); }
  async generateAssetsFromGitHub(repoLinks: string[]) { return this.gemini.generateAssetsFromGitHub(repoLinks); }
}

class OpenAIProvider implements AnalysisProvider {
  name = "OpenAI Provider";

  private async fetchOpenAI(prompt: string, jsonMode = false) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7,
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${res.status} - ${JSON.stringify(err)}`);
    }
    
    return await res.json();
  }

  async generateRoadmap(skills: any, role: string) {
    const prompt = `Generate a 40-day career roadmap for ${role} based on skills: ${JSON.stringify(skills)}.
    Respond ONLY with a JSON object containing a "roadmap" property which is an array of 40 objects. 
    Use schema: { "roadmap": [ { day, phase, primaryGoal, learningTask, practiceTask, buildingTask, reviewTask, expectedOutput, timeEstimate, milestone, youtubeVideoId, resourceLinks: [{label, url}], difficulty, points, interviewQuestions: [] } ] }`;

    const data = await this.fetchOpenAI(prompt, true);
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty roadmap data");
    
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.roadmap || parsed.steps || []);
  }

  private gemini = new GeminiProvider();
  async getMentorAdvice(history: any, profile: string) { return this.gemini.getMentorAdvice(history, profile); }
  async extractSkillsFromResume(text: string) { return this.gemini.extractSkillsFromResume(text); }
  async analyzeLinkedInProfile(text: string) { return this.gemini.analyzeLinkedInProfile(text); }
  async analyzeGitHubRepos(repos: any[], username?: string, userProfile?: any) {
    const repoData = repos.slice(0, 30).map(r => ({
      name: r.name,
      description: r.description || "No description provided",
      language: r.language || "Unknown",
      topics: r.topics || [],
      stars: r.stargazers_count || 0
    }));

    const prompt = `You are an Elite Technical Auditor. Analyze the GitHub profile for "${username || 'Unknown'}".
    ${userProfile ? `Profile: ${userProfile.name}, Bio: ${userProfile.bio}, Company: ${userProfile.company}` : ''}
    
    Data: ${JSON.stringify(repoData)}
    
    Respond strictly in JSON format:
    {
      "skills": [{"name": "string", "level": "Basic|Intermediate|Advanced", "category": "string"}],
      "topProjects": [{"name": "string", "description": "string", "techStack": ["string"]}]
    }
    Make sure to include the username "${username}" in the analysis details to prove identity verification.`;

    try {
      const data = await this.fetchOpenAI(prompt, true);
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenAI");
      const parsed = JSON.parse(content);
      
      return {
        skills: (parsed.skills || []).map((s: any) => ({ ...s, source: 'GitHub' as const, isSoftSkill: false, confidence: 0.95 })),
        projects: (parsed.topProjects || []).map((p: any) => ({ ...p, id: Math.random().toString(36).substr(2, 9), source: 'GitHub' as const }))
      };
    } catch (e) {
      console.warn("OpenAI fallback failed, using gemini", e);
      try {
        return await this.gemini.analyzeGitHubRepos(repos, username, userProfile);
      } catch (geminiError: any) {
        console.error("Gemini also failed (likely quota exceeded):", geminiError);
        // Fallback to a mock/heuristic based on languages if all APIs fail
        const languages = new Set(repos.map(r => r.language).filter(Boolean));
        return {
          skills: Array.from(languages).map(lang => ({ name: lang as string, level: 'Intermediate', category: 'Language', source: 'GitHub', isSoftSkill: false, confidence: 0.8 })),
          projects: repos.slice(0, 3).map(r => ({ name: r.name, description: r.description || "GitHub Repository", techStack: [r.language].filter(Boolean), id: Math.random().toString(36).substr(2, 9), source: 'GitHub' as const }))
        };
      }
    }
  }
  async fetchLiveMarketPulse(role: string) { return this.gemini.fetchLiveMarketPulse(role); }
  async generateCoverLetter(resume: string, title: string, company: string) { return this.gemini.generateCoverLetter(resume, title, company); }
  async getWinningStrategy(title: string, company: string, skills: string[]) { return this.gemini.getWinningStrategy(title, company, skills); }
  async getJobBenchmark(jobTitle: string, company: string, requirements: any[], userSkills: any[]) { return this.gemini.getJobBenchmark(jobTitle, company, requirements, userSkills); }
  async generateAssetsFromGitHub(repoLinks: string[]) { return this.gemini.generateAssetsFromGitHub(repoLinks); }
}

class AnalysisService {
  private providers: AnalysisProvider[];
  private statusListeners: ((status: string) => void)[] = [];
  private ruleBased = new RuleBasedProvider();

  constructor() {
    this.providers = [
      new GroqProvider(),
      new GeminiProvider(),
      new OpenAIProvider()
    ];
  }

  subscribeStatus(listener: (status: string) => void) {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyStatus(status: string) {
    this.statusListeners.forEach(l => l(status));
  }

  async execute<T>(action: (p: AnalysisProvider) => Promise<T>): Promise<T> {
    let lastError = null;
    for (const provider of this.providers) {
      try {
        this.notifyStatus(`Syncing with ${provider.name}...`);
        return await action(provider);
      } catch (err) {
        console.warn(`${provider.name} failed.`, err);
        lastError = err;
      }
    }
    
    // If all AI providers fail, and we are generating a roadmap, use the local engine
    if (action.toString().includes('generateRoadmap')) {
      this.notifyStatus("Using Neural Safety Bridge (Local)...");
      return await (this.ruleBased as any).generateRoadmap([], "Developer") as any;
    }

    this.notifyStatus("All providers failed. Retrying...");
    throw lastError || new Error("All AI providers reached operational capacity limits.");
  }

  async extractSkillsFromResume(text: string) { return this.execute(p => p.extractSkillsFromResume(text)); }
  async analyzeLinkedInProfile(text: string) { return this.execute(p => p.analyzeLinkedInProfile(text)); }
  async analyzeGitHubRepos(repos: any[], username?: string, userProfile?: any) { return this.execute(p => p.analyzeGitHubRepos(repos, username, userProfile)); }
  
  async generateRoadmap(skills: any, role: string) { 
    try {
      return await this.execute(p => p.generateRoadmap(skills, role)); 
    } catch (e) {
      // Final fallback if execute fails to catch the roadmap specifically
      return await this.ruleBased.generateRoadmap(skills, role);
    }
  }

  async fetchLiveMarketPulse(role: string) { return this.execute(p => p.fetchLiveMarketPulse(role)); }
  async getMentorAdvice(history: any, profile: string) { return this.execute(p => p.getMentorAdvice(history, profile)); }
  async generateCoverLetter(resume: string, title: string, company: string) { return this.execute(p => p.generateCoverLetter(resume, title, company)); }
  async getWinningStrategy(title: string, company: string, skills: string[]) { return this.execute(p => p.getWinningStrategy(title, company, skills)); }
  async getJobBenchmark(jobTitle: string, company: string, requirements: any[], userSkills: any[]) { return this.execute(p => p.getJobBenchmark(jobTitle, company, requirements, userSkills)); }
  async generateAssetsFromGitHub(repoLinks: string[]) { return this.execute(p => p.generateAssetsFromGitHub(repoLinks)); }
}

export const analysisService = new AnalysisService();
