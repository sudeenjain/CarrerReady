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
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import { analysisService } from '../analysisService';
import { GoogleGenAI, Type } from "@google/genai";

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
      const validExtensions = /\.(pdf|doc|docx|ppt|pptx)$/i;
      if (!validExtensions.test(file.name)) {
        setValidationErrors(["Invalid format. Allowed: PDF, DOC, DOCX, PPT, PPTX."]);
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
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(selectedFile);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              data: base64,
              mimeType: selectedFile.type || "application/pdf"
            }
          },
          {
            text: `SYSTEM: You are a high-level elite resume verification engine for CareerReady AI.
            User's Name: "${formData.name}"
            
            RIGOROUS VERIFICATION PROTOCOL:
            1. DOCUMENT CLASSIFICATION: Is this a professional CV/Resume?
            2. IDENTITY SYNC: Does the document belong to "${formData.name}"?
            3. STRUCTURAL AUDIT: Verify Education, Experience, Technical Skills, and Projects.
            
            Return a JSON object with extractedSkills and any errors.`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValidResume: { type: Type.BOOLEAN },
              nameMatch: { type: Type.BOOLEAN },
              sectionsFound: {
                type: Type.OBJECT,
                properties: {
                  education: { type: Type.BOOLEAN },
                  experience: { type: Type.BOOLEAN },
                  skills: { type: Type.BOOLEAN },
                  projects: { type: Type.BOOLEAN }
                }
              },
              errors: { type: Type.ARRAY, items: { type: Type.STRING } },
              extractedSkills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    level: { type: Type.STRING, enum: ["Basic", "Intermediate", "Advanced"] },
                    category: { type: Type.STRING },
                    isSoftSkill: { type: Type.BOOLEAN }
                  }
                }
              }
            }
          }
        }
      });

      const audit = JSON.parse(response.text || '{}');
      if (audit.errors?.length > 0) {
        setValidationErrors(audit.errors);
        setIsAnalyzing(false);
        return;
      }

      setDiscoveredSkills(audit.extractedSkills || []);
      setSubStep('verify');
    } catch (err) {
      setValidationErrors(["System Error: AI Verification Engine failed to process the document stream."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGithubSync = async () => {
    if (!formData.githubUser) return;
    setIsAnalyzing(true);
    setValidationErrors([]);
    try {
      const resp = await fetch(`https://api.github.com/users/${formData.githubUser}/repos?sort=updated&per_page=30`);
      if (!resp.ok) throw new Error("GitHub user not found");
      const repos = await resp.json();
      const result = await analysisService.analyzeGitHubRepos(repos);
      setDiscoveredSkills(result.skills || []);
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
    setValidationErrors([]);
    try {
      const result = await analysisService.analyzeLinkedInProfile(formData.linkedinProfile);
      setDiscoveredSkills(result.skills || []);
      setSubStep('verify');
    } catch (err: any) {
      setValidationErrors([err.message || "Failed to sync LinkedIn bio"]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const steps = [
    { id: 1, title: 'Identity', icon: User }, 
    { id: 2, title: 'Analysis Gate', icon: Zap }, 
    { id: 3, title: 'Benchmark', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden font-sans">
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      {/* Progress Stepper */}
      <div className="w-full max-w-xl mb-16 relative px-2">
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 rounded-full"></div>
         <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 transition-all duration-700 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
         <div className="flex justify-between relative z-10">
           {steps.map((s) => (
             <div key={s.id} className="flex flex-col items-center">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-indigo-600 text-white shadow-2xl scale-110 border border-indigo-400/50' : 'bg-[#0f172a] text-slate-600 border border-white/5'}`}>
                 {step > s.id ? <CheckCircle size={28} /> : <s.icon size={28} />}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-4 ${step >= s.id ? 'text-indigo-400' : 'text-slate-600'}`}>{s.title}</span>
             </div>
           ))}
         </div>
      </div>

      <div className="w-full max-w-xl bg-[#0f172a]/60 backdrop-blur-2xl rounded-[48px] shadow-2xl p-10 md:p-14 animate-in fade-in zoom-in-95 duration-700 border border-white/10 relative">
        {step > 1 && (
          <button 
            type="button"
            onClick={handleBack}
            className="absolute top-10 left-10 p-2 text-slate-500 hover:text-indigo-400 transition-colors"
            title="Go Back"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {step === 1 && (
          <form 
            onSubmit={(e) => { e.preventDefault(); if(formData.name) handleNext(); }}
            className="space-y-10 animate-in slide-in-from-bottom-4"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Your Identity</h2>
              <p className="text-slate-400 text-sm font-medium">Establish your professional signal in the registry.</p>
            </div>
            <div className="relative group">
               <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
               <input 
                 type="text" 
                 className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-white/5 border border-white/10 outline-none font-bold text-white focus:border-indigo-500/50 transition-all" 
                 value={formData.name} 
                 onChange={(e) => setFormData({...formData, name: e.target.value})} 
                 placeholder="Full Name (Exactly as in Resume)" 
                 autoFocus
               />
            </div>
            <button 
              type="submit" 
              disabled={!formData.name} 
              className="w-full py-5 gradient-bg text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continue <ChevronRight size={18} />
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            {subStep === 'selection' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-white tracking-tighter">Analysis Gate</h2>
                  <p className="text-slate-400 text-sm font-medium">Select a verification protocol to audit your expertise.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button type="button" onClick={() => setSubStep('resume-upload')} className="flex items-center gap-6 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20"><FileUp size={32} /></div>
                    <div><h4 className="font-black text-white">Resume Integrity Audit</h4><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Strict Section Verification</p></div>
                  </button>
                  <button type="button" onClick={() => setSubStep('github')} className="flex items-center gap-6 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/5 transition-all text-left group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 text-white flex items-center justify-center shrink-0 border border-white/10"><Github size={32} /></div>
                    <div><h4 className="font-black text-white">GitHub Evidence Pulse</h4><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Verify via Code History</p></div>
                  </button>
                  <button type="button" onClick={() => setSubStep('linkedin')} className="flex items-center gap-6 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20"><Linkedin size={32} /></div>
                    <div><h4 className="font-black text-white">LinkedIn Bio Sync</h4><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Extract Professional Signal</p></div>
                  </button>
                </div>
              </div>
            )}

            {subStep === 'resume-upload' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Resume Integrity Audit</h3>
                  <p className="text-slate-400 text-sm font-medium">Upload your professional document for structural analysis.</p>
                </div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-all cursor-pointer group relative overflow-hidden ${
                    selectedFile 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-white/10 bg-white/[0.02] hover:border-indigo-500/50'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                  {selectedFile ? (
                    <div className="space-y-4 animate-in zoom-in-95">
                      <div className="w-20 h-20 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-xl"><FileText size={40} /></div>
                      <div>
                        <p className="text-sm font-black text-white truncate max-w-xs mx-auto">{selectedFile.name}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Signal Ready for Audit</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-500 group-hover:text-indigo-400 transition-all"><Upload size={32} /></div>
                      <p className="text-sm font-black text-white">Select Professional Document</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">PDF, DOCX ONLY</p>
                    </div>
                  )}
                </div>

                {validationErrors.length > 0 && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] font-black uppercase text-red-400 tracking-widest flex items-start gap-3 text-left">
                        <AlertTriangle size={16} className="shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleResumeScan} 
                  disabled={isAnalyzing || !selectedFile} 
                  className="w-full py-5 gradient-bg text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-40 flex items-center justify-center gap-3 transition-all"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {isAnalyzing ? 'Strict Structural Audit...' : 'Authorize Integrity Scan'}
                </button>
              </div>
            )}

            {subStep === 'github' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">GitHub Evidence Pulse</h3>
                  <p className="text-slate-400 text-sm font-medium">Enter your username to verify technical expertise via code history.</p>
                </div>
                <div className="relative group">
                   <Github className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors" />
                   <input 
                     type="text" 
                     className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-white/5 border border-white/10 outline-none font-bold text-white focus:border-white/30 transition-all" 
                     value={formData.githubUser} 
                     onChange={(e) => setFormData({...formData, githubUser: e.target.value})} 
                     placeholder="GitHub Username (e.g. torvalds)" 
                     autoFocus
                   />
                </div>

                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] font-black uppercase text-red-400 tracking-widest flex items-start gap-3 text-left">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{validationErrors[0]}</span>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleGithubSync} 
                  disabled={isAnalyzing || !formData.githubUser} 
                  className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-40 flex items-center justify-center gap-3 transition-all"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  {isAnalyzing ? 'Scanning Repositories...' : 'Initiate GitHub Sync'}
                </button>
              </div>
            )}

            {subStep === 'linkedin' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">LinkedIn Bio Sync</h3>
                  <p className="text-slate-400 text-sm font-medium">Paste your LinkedIn bio or professional summary for signal extraction.</p>
                </div>
                <div className="relative group">
                   <Linkedin className="absolute left-5 top-6 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                   <textarea 
                     className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-white/5 border border-white/10 outline-none font-bold text-white focus:border-blue-500/50 transition-all min-h-[200px] resize-none custom-scrollbar" 
                     value={formData.linkedinProfile} 
                     onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})} 
                     placeholder="Paste your professional summary here..." 
                     autoFocus
                   />
                </div>

                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] font-black uppercase text-red-400 tracking-widest flex items-start gap-3 text-left">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{validationErrors[0]}</span>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleLinkedinSync} 
                  disabled={isAnalyzing || !formData.linkedinProfile} 
                  className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-40 flex items-center justify-center gap-3 transition-all"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
                  {isAnalyzing ? 'Extracting Signal...' : 'Sync Professional Bio'}
                </button>
              </div>
            )}

            {subStep === 'verify' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Detected Skill Signature</h3>
                  <p className="text-slate-400 text-sm font-medium">The AI has extracted the following expertise signals.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {discoveredSkills.map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{s.name}</span>
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setStep(3)} className="w-full py-5 gradient-bg text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                  Proceed to Benchmark <ArrowRight size={18}/>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <form 
            onSubmit={(e) => { e.preventDefault(); if(formData.targetRole) handleNext(); }}
            className="space-y-10 animate-in slide-in-from-bottom-4"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Job Benchmark</h2>
              <p className="text-slate-400 text-sm font-medium">Select your target role to calibrate the roadmap.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {JOB_ROLES.map((role) => (
                <button 
                  type="button"
                  key={role.id} 
                  onClick={() => setFormData({...formData, targetRole: role.title})} 
                  className={`text-left p-6 rounded-[32px] border transition-all flex items-center justify-between group ${formData.targetRole === role.title ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${formData.targetRole === role.title ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-600'}`}>
                      <Briefcase size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-white">{role.title}</h4>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Benchmark Mode</p>
                    </div>
                  </div>
                  {formData.targetRole === role.title && <CheckCircle size={20} className="text-indigo-400" />}
                </button>
              ))}
            </div>
            <button type="submit" disabled={!formData.targetRole} className="w-full py-6 gradient-bg text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              Unlock Career Roadmap <Zap size={18} className="inline ml-2"/>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Onboarding;