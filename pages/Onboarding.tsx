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
  Search
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
      } catch (e) {
        localStorage.removeItem(ONBOARDING_PERSIST_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ONBOARDING_PERSIST_KEY, JSON.stringify({
      formData, step, subStep, skills: discoveredSkills
    }));
  }, [formData, step, subStep, discoveredSkills]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      localStorage.removeItem(ONBOARDING_PERSIST_KEY);
      onComplete({
        name: formData.name,
        targetRole: formData.targetRole,
        currentSkills: discoveredSkills.length > 0 ? discoveredSkills : user.currentSkills,
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
    try {
      const resp = await fetch(`https://api.github.com/users/${formData.githubUser}/repos?sort=updated&per_page=30`);
      if (!resp.ok) throw new Error("GitHub user not found");
      const repos = await resp.json();
      const result = await analysisService.analyzeGitHubRepos(repos);
      setDiscoveredSkills(prev => [...prev, ...result.skills]);
      setSubStep('verify');
    } catch (err: any) {
      setValidationErrors([err.message || "Failed to sync GitHub"]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLinkedinSync = async () => {
    if (!formData.linkedinProfile) return;
    setIsAnalyzing(true);
    try {
      const result = await analysisService.analyzeLinkedInProfile(formData.linkedinProfile);
      setDiscoveredSkills(prev => [...prev, ...result.skills]);
      setSubStep('verify');
    } catch (err) {
      setValidationErrors(["LinkedIn extraction failed."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const steps = [{ id: 1, title: 'Identity', icon: User }, { id: 2, title: 'Analysis Gate', icon: Zap }, { id: 3, title: 'Benchmark', icon: Target }];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="w-full max-w-xl mb-12 relative px-2">
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>
         <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 transition-all duration-700 rounded-full" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
         <div className="flex justify-between relative z-10">
           {steps.map((s) => (
             <div key={s.id} className="flex flex-col items-center">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${step >= s.id ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700 border-2 border-slate-100 dark:border-slate-800'}`}>
                 {step > s.id ? <CheckCircle size={28} /> : <s.icon size={28} />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest mt-4 ${step >= s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>{s.title}</span>
             </div>
           ))}
         </div>
      </div>

      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl p-10 md:p-14 animate-in fade-in zoom-in-95 duration-700 border border-slate-100 dark:border-slate-800 relative">
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
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Your Identity</h2>
            <div className="relative">
               <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
               <input 
                 type="text" 
                 className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-bold" 
                 value={formData.name} 
                 onChange={(e) => setFormData({...formData, name: e.target.value})} 
                 placeholder="Full Name (Exactly as in Resume)" 
               />
            </div>
            <button 
              onClick={handleNext} 
              disabled={!formData.name} 
              className="w-full px-6 py-3 bg-[#1f2937] text-white rounded-lg border border-[#374151] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-[#111827] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={22} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            {subStep === 'selection' && (
              <div className="space-y-6">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Analysis Gate</h2>
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => setSubStep('resume-upload')} className="flex items-center gap-6 p-6 rounded-lg border border-[#374151] hover:bg-[#111827] hover:-translate-y-0.5 transition-all text-left group bg-[#1f2937]">
                    <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0"><FileUp size={32} /></div>
                    <div><h4 className="font-semibold text-white">Strict Resume Verification</h4><p className="text-xs text-gray-400 font-medium">Robust Section Audit (Education, Exp...)</p></div>
                  </button>
                  <button onClick={() => setSubStep('github')} className="flex items-center gap-6 p-6 rounded-lg border border-[#374151] hover:bg-[#111827] hover:-translate-y-0.5 transition-all text-left group bg-[#1f2937]">
                    <div className="w-16 h-16 rounded-lg bg-gray-700 text-white flex items-center justify-center shrink-0"><Github size={32} /></div>
                    <div><h4 className="font-semibold text-white">GitHub Evidence Pulse</h4><p className="text-xs text-gray-400 font-medium">Verify skills via code history.</p></div>
                  </button>
                  <button onClick={() => setSubStep('linkedin')} className="flex items-center gap-6 p-6 rounded-lg border border-[#374151] hover:bg-[#111827] hover:-translate-y-0.5 transition-all text-left group bg-[#1f2937]">
                    <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0"><Linkedin size={32} /></div>
                    <div><h4 className="font-semibold text-white">LinkedIn Sync</h4><p className="text-xs text-gray-400 font-medium">Extract bio intelligence.</p></div>
                  </button>
                </div>
              </div>
            )}

            {subStep === 'resume-upload' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-2xl font-black dark:text-white tracking-tight">Resume Integrity Audit</h3>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-all cursor-pointer group relative overflow-hidden ${
                    selectedFile 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} />
                  {selectedFile ? (
                    <div className="space-y-4 animate-in zoom-in-95">
                      <div className="w-20 h-20 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-xl"><FileText size={40} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-xs mx-auto">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Signal Ready for Audit</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-indigo-500 transition-all"><Upload size={32} /></div>
                      <p className="text-sm font-black dark:text-white">Select Professional Document</p>
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
                  className="w-full px-6 py-3 bg-[#1f2937] text-white rounded-lg border border-[#374151] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-[#111827] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  {isAnalyzing ? 'Strict Structural Audit...' : 'Authorize Integrity Scan'}
                </button>
              </div>
            )}

            {(subStep === 'github' || subStep === 'linkedin') && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-2xl font-black dark:text-white">{subStep === 'github' ? 'GitHub Audit' : 'LinkedIn Analysis'}</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full px-6 py-5 rounded-[24px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-bold" 
                    placeholder={subStep === 'github' ? 'GitHub Username' : 'LinkedIn Professional Bio Text'} 
                    value={subStep === 'github' ? formData.githubUser : formData.linkedinProfile} 
                    onChange={(e) => subStep === 'github' ? setFormData({...formData, githubUser: e.target.value}) : setFormData({...formData, linkedinProfile: e.target.value})} 
                  />
                </div>
                <button 
                  onClick={subStep === 'github' ? handleGithubSync : handleLinkedinSync} 
                  className="w-full px-6 py-3 bg-[#1f2937] text-white rounded-lg border border-[#374151] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-[#111827] hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isAnalyzing ? 'Synthesizing Signal...' : 'Confirm Intelligence'}
                </button>
              </div>
            )}

            {subStep === 'verify' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-2xl font-black dark:text-white">Detected Skill Signature</h3>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {discoveredSkills.map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-white">{s.name}</span>
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(3)} className="w-full px-6 py-3 bg-[#1f2937] text-white rounded-lg border border-[#374151] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-[#111827] hover:-translate-y-0.5 active:translate-y-0">
                  Proceed to Benchmark <ArrowRight size={20}/>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Job Benchmark</h2>
            <div className="grid grid-cols-1 gap-4">
              {JOB_ROLES.map((role) => (
                <button 
                  key={role.id} 
                  onClick={() => setFormData({...formData, targetRole: role.title})} 
                  className={`text-left p-6 rounded-lg border transition-all flex items-center justify-between ${
                    formData.targetRole === role.title 
                      ? 'border-[#3b82f6] bg-[#111827]' 
                      : 'border-[#374151] bg-[#1f2937] hover:bg-[#111827] hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                      formData.targetRole === role.title 
                        ? 'bg-[#3b82f6] text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      <Briefcase size={28} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{role.title}</h4>
                      <p className="text-xs text-gray-400 font-medium">Benchmark Mode</p>
                    </div>
                  </div>
                  {formData.targetRole === role.title && <CheckCircle size={20} className="text-[#3b82f6]" />}
                </button>
              ))}
            </div>
            <button onClick={handleNext} className="w-full px-6 py-3 bg-[#1f2937] text-white rounded-lg border border-[#374151] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease hover:bg-[#111827] hover:-translate-y-0.5 active:translate-y-0">
              Unlock Career Roadmap <Zap size={20} className="inline"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;