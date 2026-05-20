
import { Skill, Project, RoadmapStep, ChatMessage } from './types';

export interface AnalysisProvider {
  name: string;
  
  extractSkillsFromResume(text: string): Promise<{ skills: Skill[], level: string, projects: Project[] }>;
  
  analyzeLinkedInProfile(profileText: string): Promise<{ skills: Skill[], projects: Project[] }>;
  
  analyzeGitHubRepos(repos: any[], username?: string, userProfile?: any): Promise<{ skills: Skill[], projects: Project[] }>;
  
  generateRoadmap(currentSkills: Skill[], targetRole: string): Promise<RoadmapStep[]>;
  
  fetchLiveMarketPulse(role: string, location?: string): Promise<any>;
  
  getMentorAdvice(history: ChatMessage[], userProfile: string): Promise<string>;
  
  generateCoverLetter(resume: string, targetTitle: string, companyName: string): Promise<string>;
  
  getWinningStrategy(jobTitle: string, company: string, userSkills: string[]): Promise<any>;
  
  getJobBenchmark(jobTitle: string, company: string, requirements: any[], userSkills: any[]): Promise<any>;
  
  generateAssetsFromGitHub(repoLinks: string[]): Promise<{ resumeSnippet: string; portfolioSnippet: string }>;
}
