
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisProvider } from './analysisProvider';
import { Skill, SkillLevel, RoadmapStep, Project, ChatMessage } from "./types";

export class GeminiProvider implements AnalysisProvider {
  name = "Gemini AI Provider";

  private getClient() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
    return new GoogleGenAI({ apiKey });
  }

  async extractSkillsFromResume(text: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this professional profile. 
      1. Extract technical skills AND soft skills.
      2. Identify specific projects mentioned and extract their real-world impact and metrics.
      3. Assign proficiency levels based on depth of experience.
      4. Provide an advanced real-world benchmark comparing the candidate's skills and projects to industry standards for senior/mid/junior levels.
      
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING, enum: Object.values(SkillLevel) },
                  category: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  isSoftSkill: { type: Type.BOOLEAN }
                },
                required: ["name", "level", "category", "confidence", "isSoftSkill"]
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  realWorldImpact: { type: Type.STRING },
                  metrics: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            detectedExperienceLevel: { type: Type.STRING },
            industryBenchmark: { type: Type.STRING }
          },
          required: ["skills", "projects", "detectedExperienceLevel", "industryBenchmark"]
        }
      }
    });

    const textResponse = response.text || "{}";
    const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      skills: (data.skills || []).map((s: any) => ({ ...s, source: 'Resume' as const })),
      projects: (data.projects || []).map((p: any) => ({ 
        ...p, 
        id: Math.random().toString(36).substr(2, 9), 
        source: 'Manual' as const,
        description: `${p.description}\nImpact: ${p.realWorldImpact || 'N/A'}\nMetrics: ${(p.metrics || []).join(', ') || 'N/A'}`
      })),
      level: data.detectedExperienceLevel || 'Not specified',
      benchmark: data.industryBenchmark || 'No benchmark available'
    };
  }

  async analyzeLinkedInProfile(profileText: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a deep signal analysis of this LinkedIn bio/summary. 
      Even if the text is short, identify the core professional domain and extract associated skills.
      
      Input Profile Text: "${profileText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING, enum: Object.values(SkillLevel) },
                  category: { type: Type.STRING },
                  isSoftSkill: { type: Type.BOOLEAN }
                },
                required: ["name", "level", "category", "isSoftSkill"]
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || '{"skills":[], "experience":[]}';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      skills: (data.skills || []).map((s: any) => ({ ...s, source: 'LinkedIn' as const })),
      projects: (data.experience || []).map((e: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: `${e.role} at ${e.company}`,
        description: `Experience identified from professional social profile signal.`,
        techStack: [],
        source: 'LinkedIn' as const
      }))
    };
  }

  async analyzeGitHubRepos(repos: any[], username?: string, userProfile?: any) {
    const ai = this.getClient();
    // Increase to 30 repos for better coverage
    const repoData = repos.slice(0, 30).map(r => ({
      name: r.name,
      description: r.description || "No description provided",
      language: r.language || "Unknown",
      topics: r.topics || [],
      stars: r.stargazers_count || 0
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an Elite Technical Auditor and Senior Software Architect.
      Analyze the GitHub profile and repositories for the user "${username || 'Unknown'}" to extract a comprehensive technical skill signature.
      
      ${userProfile ? `USER PROFILE DATA:
      Name: ${userProfile.name || 'N/A'}
      Bio: ${userProfile.bio || 'N/A'}
      Company: ${userProfile.company || 'N/A'}
      Public Repos: ${userProfile.public_repos || 0}
      Followers: ${userProfile.followers || 0}
      ` : ''}
      
      INSTRUCTIONS:
      1. Identify core technical skills (Languages, Frameworks, Tools) based on the provided repository data. If User Profile Data indicates domain expertise, incorporate it.
      2. Infer proficiency levels: 
         - 'Advanced': For skills used in repositories with complex descriptions, high star counts, or multiple related topics.
         - 'Intermediate': For primary languages in well-defined repositories.
         - 'Basic': For secondary languages or skills in repositories with minimal activity.
      3. Categorize skills (e.g., Frontend, Backend, DevOps, Data Science, Security).
      4. Highlight the most significant projects (Top 3-5) with their tech stack. It's IMPERATIVE to include the username "${username || 'Unknown'}" in the project name or description when relevant to show a direct profile audit.
      
      DATA: ${JSON.stringify(repoData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING, enum: Object.values(SkillLevel) },
                  category: { type: Type.STRING }
                },
                required: ["name", "level", "category"]
              }
            },
            topProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "description", "techStack"]
              }
            }
          },
          required: ["skills", "topProjects"]
        }
      }
    });

    const text = response.text || "{}";
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini GitHub response", cleaned);
      return { skills: [], projects: [] };
    }
    
    return {
      skills: (data.skills || []).map((s: any) => ({ ...s, source: 'GitHub' as const, isSoftSkill: false, confidence: 0.95 })),
      projects: (data.topProjects || []).map((p: any) => ({ ...p, id: Math.random().toString(36).substr(2, 9), source: 'GitHub' as const }))
    };
  }

  async generateRoadmap(currentSkills: Skill[], targetRole: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Act as a Senior Career Strategist and Mentor. Generate a STANDARDIZED DAILY actionable roadmap for a ${targetRole}. 
      Personalize based on current skills: ${JSON.stringify(currentSkills)}.
      
      STRICT STRUCTURE & PHASE REQUIREMENTS:
      Phase 1: Foundation (Days 1-7) - FOCUS: Core principles. VIDEO REQUIREMENT: Sequential progression from Absolute Beginner (Day 1) to Advanced (Day 7) based on their benchmark.
      Phase 2: Skill Building (Days 8-21) - FOCUS: Deep dives into specific tools.
      Phase 3: Projects (Days 22-30) - FOCUS: 1-week intensive projects. SPECIAL REQUIREMENT: Every day must involve building part of a project that WILL be submitted to GitHub. The expectedOutput must explicitly mention "GitHub Commit" or "Repo Ready".
      Phase 4: Interview Readiness (Days 31-40) - FOCUS: Interview preparation. SPECIAL REQUIREMENT: Provide 3-5 specific technical/behavioral interview questions for each day in the 'interviewQuestions' field. VIDEO REQUIREMENT: Videos must specifically cover interview preparation, mock interviews, or common pitfalls for the role.
      
      EVERY SINGLE DAY MUST BE A COMPREHENSIVE MENTOR-LED MODULE INCLUDING:
      - day (Number)
      - phase (One of the 4 strict phases)
      - primaryGoal (A summary of what this specific day achieves)
      - learningTask (Theoretical concepts/topics)
      - practiceTask (Exercises)
      - buildingTask (Project work)
      - reviewTask (Verification)
      - expectedOutput (Verifiable tangible artifact)
      - timeEstimate (e.g., "180 mins")
      - milestone (Brief status every 7th day, else null)
      - youtubeVideoId (A valid, real YouTube Video ID. For Phase 1, ensure progression. For Phase 4, ensure it's about interviews.)
      - resourceLinks (Official docs or high-quality posts)
      - difficulty (Beginner/Intermediate/Advanced/Expert)
      - points (50-500)
      - interviewQuestions (Array of strings, ONLY for Phase 4, otherwise empty)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.NUMBER },
              phase: { type: Type.STRING, enum: ["Foundation", "Skill Building", "Projects", "Interview Readiness"] },
              primaryGoal: { type: Type.STRING },
              learningTask: { type: Type.STRING },
              practiceTask: { type: Type.STRING },
              buildingTask: { type: Type.STRING },
              reviewTask: { type: Type.STRING },
              expectedOutput: { type: Type.STRING },
              timeEstimate: { type: Type.STRING },
              milestone: { type: Type.STRING, nullable: true },
              youtubeVideoId: { type: Type.STRING, nullable: true },
              resourceLinks: {
                type: Type.ARRAY,
                nullable: true,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ["label", "url"]
                }
              },
              difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
              points: { type: Type.NUMBER },
              interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }
            },
            required: ["day", "phase", "primaryGoal", "learningTask", "practiceTask", "buildingTask", "reviewTask", "expectedOutput", "timeEstimate", "difficulty", "points"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  }

  async fetchLiveMarketPulse(role: string, location: string = "India") {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide current hiring trends, internship counts, and market data for ${role} in ${location} for Q3 2024.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hotSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            emergingTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
            salaryRange: { type: Type.STRING },
            marketOutlook: { type: Type.STRING },
            internshipRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["hotSkills", "emergingTrends", "salaryRange", "marketOutlook", "internshipRecommendations"]
        }
      }
    });
    
    const data = JSON.parse(response.text || '{}');
    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter((chunk: any) => chunk.web)
      ?.map((chunk: any) => chunk.web.uri) || [];
      
    return {
      ...data,
      sources: groundingSources
    };
  }

  async getMentorAdvice(history: ChatMessage[], userProfile: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an Elite AI System Architect and Career Strategist.
      
      OBJECTIVE:
      Provide structured, professional advice for ${userProfile}.
      
      CONSTRAINTS:
      - Use **bold headers** for sections.
      - Use bullet points for steps.
      - Be clear, professional, and actionable.
      - DO NOT provide marketing fluff.
      
      Recent History: ${JSON.stringify(history)}`,
    });
    return response.text || '';
  }

  async generateCoverLetter(resumeSummary: string, jobTitle: string, companyName: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a high-impact, elite architect-style cover letter for a ${jobTitle} at ${companyName}. Resume context: ${resumeSummary}`,
    });
    return response.text || '';
  }

  async getWinningStrategy(jobTitle: string, company: string, userSkills: string[]) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a 3-step winning strategy for ${jobTitle} at ${company}. User Skills: ${userSkills.join(', ')}`,
    });
    return response.text || '';
  }

  async getJobBenchmark(jobTitle: string, company: string, requirements: any[], userSkills: any[]): Promise<any> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a detailed interview benchmark for a ${jobTitle} at ${company}.
      Requirements: ${JSON.stringify(requirements)}
      User Skills: ${JSON.stringify(userSkills)}
      
      Respond ONLY in valid JSON format:
      {
        "gapAnalysis": "Summary of critical missing skills or experience gaps",
        "technicalQuestions": ["3 highly specific technical interview questions"],
        "behavioralFocus": "Key behavioral traits or STAR examples they should prepare"
      }`
    });
    const text = response.text || "{}";
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }

  async generateAssetsFromGitHub(repoLinks: string[]): Promise<{ resumeSnippet: string; portfolioSnippet: string }> {
    const ai = this.getClient();
    const linksText = repoLinks.join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze these GitHub repository links based on URL structures and typical project conventions: ${linksText}
      
      Create two distinct professional assets derived from these links:
      1. A 'resumeSnippet': 3-4 highly professional, results-oriented bullet points using the STAR method suitable for a technical resume.
      2. A 'portfolioSnippet': A structured markdown section suitable for a personal portfolio website, including a catchy project title, a 2-sentence overview, and a "Tech Stack Highlights" section.
      
      Respond ONLY in valid JSON format:
      {
        "resumeSnippet": "Bullet points separated by newline",
        "portfolioSnippet": "Markdown string for portfolio"
      }`
    });
    
    try {
      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini asset response", e);
      return {
        resumeSnippet: "• Contributed to GitHub repositories: " + linksText + "\n• Implemented features and resolved technical debt\n• Collaborated via version control and PR reviews",
        portfolioSnippet: "### GitHub Projects Overview\n**Repositories:** " + linksText + "\n\nShowcase of technical projects. See individual repositories for detailed documentation and code."
      };
    }
  }
}
