import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Skill, SkillLevel } from '../types';
import { JOB_ROLES } from '../constants';
import { 
  User, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  Loader2, 
  Target, 
  Zap, 
  ArrowRight, 
  Github, 
  AlertTriangle, 
  ChevronLeft, 
  Linkedin,
  Upload,
  FileUp,
  X,
  ShieldCheck,
  Search,
  Code,
  Database,
  Smartphone,
  Cloud,
  BarChart3,
  Shield,
  Layers
} from 'lucide-react';
import { analysisService } from '../analysisService';
import { apiUpload } from '../src/api/client';

type OnboardingProps = {
  user: UserProfile;
  onComplete: (data: Partial<UserProfile>) => void;
};

const ONBOARDING_PERSIST_KEY = 'cr_onboarding_temp';

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<'selection' | 'resume-upload' | 'github' | 'linkedin' | 'verify'>('selection');
  const [formData, setFormData] = useState({
    name: user.name || '',
    targetRole: user.targetRole || '',
    githubUser: '',
    linkedinProfile: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [discoveredSkills, setDiscoveredSkills] = useState<Skill[]>([]);
  const [discoveredProjects, setDiscoveredProjects] = useState<Project[]>([]);
  const [rawGithubRepos, setRawGithubRepos] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Persistence: Save and Load progress
  useEffect(() => {
    const saved = localStorage.getItem(ONBOARDING_PERSIST_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || formData);
        setStep(parsed.step || 1);
        setSubStep(parsed.subStep || 'selection');
        setDiscoveredSkills(parsed.skills || []);
        setRawGithubRepos(parsed.rawRepos || []);
      } catch (e) {
        localStorage.removeItem(ONBOARDING_PERSIST_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ONBOARDING_PERSIST_KEY, JSON.stringify({
      formData, step, subStep, skills: discoveredSkills, rawRepos: rawGithubRepos
    }));
  }, [formData, step, subStep, discoveredSkills, rawGithubRepos]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      localStorage.removeItem(ONBOARDING_PERSIST_KEY);
      onComplete({
        name: formData.name,
        targetRole: formData.targetRole,
        currentSkills: discoveredSkills.length > 0 ? discoveredSkills : user.currentSkills,
        projects: discoveredProjects.length > 0 ? discoveredProjects : user.projects,
        githubUser: formData.githubUser,
        linkedinUser: formData.linkedinProfile
      });
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSubStep('selection');
    } else if (step === 2) {
      if (subStep === 'selection') {
        setStep(1);
      } else {
        setSubStep('selection');
        setValidationErrors([]);
        setSelectedFile(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationErrors([]);
    if (file) {
      const validExtensions = /\.(pdf|docx)$/i;
      if (!validExtensions.test(file.name)) {
        setValidationErrors(["Invalid format. Allowed: PDF, DOCX."]);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleResumeScan = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setValidationErrors([]);
    
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const result = await apiUpload<{
        detected_skills: { name: string; level: 'Basic' | 'Intermediate' | 'Advanced' }[];
        ats_score: number;
        industry_compatibility: number;
        suggestions: string[];
      }>('/api/v1/resume/analyze', form);

      const extracted = (result.detected_skills || []).map(s => ({
        name: s.name,
        level: s.level,
        category: 'Resume',
        source: 'Resume' as const,
        isSoftSkill: false,
      }));

      setDiscoveredSkills(extracted);
      setSubStep('verify');
    } catch (err) {
      setValidationErrors(["Resume analysis failed. Ensure a valid PDF/DOCX is uploaded, and that the backend is running on VITE_API_BASE_URL."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGithubSync = async () => {
    if (!formData.githubUser) return;
    setIsAnalyzing(true);
    setValidationErrors([]);
    
    try {
      const token = import.meta.env.VITE_GITHUB_TOKEN;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const profileResp = await fetch(`https://api.github.com/users/${formData.githubUser}`, { headers });
      let userProfile = null;
      if (profileResp.ok) {
        userProfile = await profileResp.json();
      }

      const resp = await fetch(`https://api.github.com/users/${formData.githubUser}/repos?sort=updated&per_page=30`, {
        headers
      });

      if (!resp.ok) {
        if (resp.status === 404) throw new Error("GitHub user not found");
        if (resp.status === 403) throw new Error("GitHub API rate limit exceeded. Please try again later or add a VITE_GITHUB_TOKEN.");
        throw new Error(`GitHub API error: ${resp.statusText}`);
      }

      const repos = await resp.json();
      if (!repos || repos.length === 0) {
        throw new Error("No public repositories found for this user.");
      }
      setRawGithubRepos(repos);

      const result = await analysisService.analyzeGitHubRepos(repos, formData.githubUser, userProfile);
      
      if (!result.skills || result.skills.length === 0) {
        throw new Error("AI could not extract technical skills from your repositories. Try a different user or check if repos have code.");
      }

      setDiscoveredSkills(prev => {
        const skillMap = new Map();
        prev.forEach(s => skillMap.set(s.name.toLowerCase(), s));
        result.skills.forEach(s => skillMap.set(s.name.toLowerCase(), s));
        return Array.from(skillMap.values());
      });
      setDiscoveredProjects(prev => {
        const projectMap = new Map();
        prev.forEach(p => projectMap.set(p.name.toLowerCase(), p));
        (result.projects || []).forEach(p => projectMap.set(p.name.toLowerCase(), p));
        return Array.from(projectMap.values());
      });
      setSubStep('verify');
    } catch (err: any) {
      setValidationErrors([err.message || "Failed to sync GitHub"]);
      console.error("GitHub Sync Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLinkedinSync = async () => {
    if (!formData.linkedinProfile) return;
    setIsAnalyzing(true);
    try {
      const result = await analysisService.analyzeLinkedInProfile(formData.linkedinProfile);
      setDiscoveredSkills(prev => {
        const skillMap = new Map();
        prev.forEach(s => skillMap.set(s.name.toLowerCase(), s));
        result.skills.forEach(s => skillMap.set(s.name.toLowerCase(), s));
        return Array.from(skillMap.values());
      });
      setDiscoveredProjects(prev => {
        const projectMap = new Map();
        prev.forEach(p => projectMap.set(p.name.toLowerCase(), p));
        (result.projects || []).forEach(p => projectMap.set(p.name.toLowerCase(), p));
        return Array.from(projectMap.values());
      });
      setSubStep('verify');
    } catch (err) {
      setValidationErrors(["LinkedIn extraction failed."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const steps = [{ id: 1, title: 'Identity', icon: User }, { id: 2, title: 'Analysis Gate', icon: Zap }, { id: 3, title: 'Benchmark', icon: Target }];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="w-full max-w-xl mb-12 relative px-2">
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>
         <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 transition-all duration-700 rounded-full" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
         <div className="flex justify-between relative z-10">
           {steps.map((s) => (
             <div key={s.id} className="flex flex-col items-center">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${step >= s.id ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-2 border-[var(--border-color)]'}`}>
                 {step > s.id ? <CheckCircle size={28} /> : <s.icon size={28} />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest mt-4 ${step >= s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-muted)]'}`}>{s.title}</span>
             </div>
           ))}
         </div>
      </div>

      <div className="w-full max-w-xl bg-[var(--bg-card)] rounded-[40px] shadow-2xl p-10 md:p-14 animate-in fade-in zoom-in-95 duration-700 border border-[var(--border-color)] relative">
        {step > 1 && (
          <button 
            onClick={handleBack}
            className="absolute top-10 left-10 p-2 text-slate-400 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400 transition-colors"
            title="Go Back"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Your Identity</h2>
            <div className="relative">
               <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
               <input 
                 type="text" 
                 className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none font-bold" 
                 value={formData.name} 
                 onChange={(e) => setFormData({...formData, name: e.target.value})} 
                 placeholder="Full Name (Exactly as in Resume)" 
               />
            </div>
            <button 
              onClick={handleNext} 
              disabled={!formData.name} 
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl border border-indigo-500/20 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={22} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            {subStep === 'selection' && (
              <div className="space-y-6">
                <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Analysis Gate</h2>
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => setSubStep('resume-upload')} className="flex items-center gap-6 p-6 rounded-lg border border-[var(--border-color)] hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-left group bg-[var(--glass-bg)] text-[var(--text-main)]">
                    <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0"><FileUp size={32} /></div>
                    <div><h4 className="font-semibold text-[var(--text-main)] dark:text-white">Strict Resume Verification</h4><p className="text-xs text-[var(--text-muted)] font-medium">Robust Section Audit (Education, Exp...)</p></div>
                  </button>
                  <button onClick={() => setSubStep('github')} className="flex items-center gap-6 p-6 rounded-lg border border-[var(--border-color)] hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-left group bg-[var(--glass-bg)] text-[var(--text-main)]">
                    <div className="w-16 h-16 rounded-lg bg-[var(--input-bg)] text-[var(--text-main)] dark:text-white flex items-center justify-center shrink-0"><Github size={32} /></div>
                    <div><h4 className="font-semibold text-[var(--text-main)] dark:text-white">GitHub Evidence Pulse</h4><p className="text-xs text-[var(--text-muted)] font-medium">Verify skills via code history.</p></div>
                  </button>
                  <button onClick={() => setSubStep('linkedin')} className="flex items-center gap-6 p-6 rounded-lg border border-[var(--border-color)] hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-left group bg-[var(--glass-bg)] text-[var(--text-main)]">
                    <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0"><Linkedin size={32} /></div>
                    <div><h4 className="font-semibold text-[var(--text-main)] dark:text-white">LinkedIn Sync</h4><p className="text-xs text-[var(--text-muted)] font-medium">Extract bio intelligence.</p></div>
                  </button>
                </div>
              </div>
            )}

            {subStep === 'resume-upload' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-2xl font-black dark:text-[var(--text-main)] dark:text-white tracking-tight">Resume Integrity Audit</h3>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-all cursor-pointer group relative overflow-hidden ${
                    selectedFile 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' 
                    : 'border-[var(--border-color)] hover:border-indigo-500'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} />
                  {selectedFile ? (
                    <div className="space-y-4 animate-in zoom-in-95">
                      <div className="w-20 h-20 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-xl"><FileText size={40} /></div>
                      <div>
                        <p className="text-sm font-black text-[var(--text-main)] truncate max-w-xs mx-auto">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Signal Ready for Audit</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-[var(--input-bg)] rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-indigo-500 transition-all"><Upload size={32} /></div>
                      <p className="text-sm font-black dark:text-[var(--text-main)] dark:text-white">Select Professional Document</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">PDF, DOCX, PPTX ONLY</p>
                    </div>
                  )}
                </div>

                {validationErrors.length > 0 && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-[10px] font-black uppercase text-red-500 tracking-widest flex items-start gap-3 text-left">
                        <AlertTriangle size={16} className="shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={handleResumeScan} 
                  disabled={isAnalyzing || !selectedFile} 
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl border border-indigo-500/20 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  {isAnalyzing ? 'Strict Structural Audit...' : 'Authorize Integrity Scan'}
                </button>
              </div>
            )}

            {(subStep === 'github' || subStep === 'linkedin') && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-2xl font-black dark:text-[var(--text-main)] dark:text-white">{subStep === 'github' ? 'GitHub Audit' : 'LinkedIn Analysis'}</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full px-6 py-5 rounded-[24px] bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none font-bold" 
                    placeholder={subStep === 'github' ? 'GitHub Username' : 'LinkedIn Professional Bio Text'} 
                    value={subStep === 'github' ? formData.githubUser : formData.linkedinProfile} 
                    onChange={(e) => subStep === 'github' ? setFormData({...formData, githubUser: e.target.value}) : setFormData({...formData, linkedinProfile: e.target.value})} 
                  />
                </div>
                
                {validationErrors.length > 0 && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-[10px] font-black uppercase text-red-500 tracking-widest flex items-start gap-3 text-left">
                        <AlertTriangle size={16} className="shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={subStep === 'github' ? handleGithubSync : handleLinkedinSync} 
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl border border-indigo-500/20 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isAnalyzing ? 'Synthesizing Signal...' : 'Confirm Intelligence'}
                </button>
              </div>
            )}

            {subStep === 'verify' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-2xl font-black dark:text-[var(--text-main)] dark:text-white">Detected Skill Signature {formData.githubUser ? `for @${formData.githubUser}` : ''}</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Verified Identity: {formData.githubUser || 'User'}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {discoveredSkills.map((s, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-xs font-black text-[var(--text-main)]">{s.name}</span>
                          <CheckCircle size={14} className="text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {discoveredProjects.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Proof of Work (Projects)</h4>
                      <div className="space-y-3">
                        {discoveredProjects.map((p, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-indigo-400">{p.name} <span className="text-[9px] text-slate-500 font-normal ml-1">(@{formData.githubUser})</span></span>
                              <div className="flex gap-1">
                                {p.techStack.slice(0, 3).map((tech, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-[8px] font-bold text-indigo-300 uppercase tracking-tighter">{tech}</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-2 italic leading-relaxed">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rawGithubRepos.length > 0 && formData.githubUser && (
                    <div className="space-y-2 mt-6">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1 flex items-center gap-2">
                        <Github size={12} /> Raw Evidence ({rawGithubRepos.length} Repositories Scanned)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {rawGithubRepos.map((repo, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-slate-300 truncate">{repo.name}</span>
                              {repo.language && <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[8px] font-black text-indigo-400">{repo.language}</span>}
                            </div>
                            <p className="text-[9px] text-slate-500 line-clamp-1">{repo.description || 'No description available'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => setStep(3)} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl border border-indigo-500/20 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0">
                  Proceed to Benchmark <ArrowRight size={20}/>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">Job Benchmark</h2>
            <div className="grid grid-cols-1 gap-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {JOB_ROLES.map((role) => {
                const iconMap: Record<string, React.ReactNode> = {
                  frontend: <Code size={28} />,
                  backend: <Database size={28} />,
                  fullstack: <Layers size={28} />,
                  datascience: <BarChart3 size={28} />,
                  mobile: <Smartphone size={28} />,
                  devops: <Cloud size={28} />,
                  product: <Target size={28} />,
                  security: <Shield size={28} />,
                };
                const isSelected = formData.targetRole === role.title;
                return (
                  <button 
                    key={role.id} 
                    onClick={() => setFormData({...formData, targetRole: role.title})} 
                    className={`text-left p-5 rounded-2xl border transition-all flex items-start gap-5 group ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' 
                        : 'border-[var(--border-color)] bg-[var(--glass-bg)] hover:border-indigo-500/40 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-[var(--input-bg)] text-[var(--text-muted)] group-hover:text-indigo-500'
                    }`}>
                      {iconMap[role.id] || <Briefcase size={28} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-[var(--text-main)] text-sm">{role.title}</h4>
                        {isSelected && <CheckCircle size={18} className="text-indigo-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] font-medium mt-1 line-clamp-2 leading-relaxed">{role.description}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--input-bg)] rounded-lg text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest border border-[var(--border-color)]">
                        <Zap size={10} /> {role.requirements.length} core skills
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={handleNext} disabled={!formData.targetRole} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl border border-indigo-500/20 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
              Unlock Career Roadmap <Zap size={20} className="inline"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;