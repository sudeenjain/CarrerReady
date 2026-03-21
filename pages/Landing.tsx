import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Network, 
  Mic, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle,
  UserPlus,
  LogIn,
  Github,
  Globe
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Landing: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<{ code?: string, message: string } | null>(null);

  const handleFirebaseLogin = async () => {
    if (!agreedToTerms) {
      setError({ message: "Mandatory: You must agree to the Terms & Conditions to proceed." });
      return;
    }
    
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      onLogin({
        name: user.displayName || 'Architect',
        email: user.email || '',
        picture: user.photoURL || ''
      });
      
      navigate('/onboarding');
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let friendlyMessage = "Failed to establish secure link via Firebase.";
      if (err.code === 'auth/unauthorized-domain') {
        friendlyMessage = "This environment domain is not whitelisted in the Security Registry.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        friendlyMessage = "Authentication window was closed before completion.";
      }
      setError({ code: err.code, message: friendlyMessage });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const features = [
    {
      icon: Cpu,
      title: "Evidence Engine",
      desc: "Deep-scans GitHub footprints and documentation to verify technical competency beyond keywords."
    },
    {
      icon: Network,
      title: "Gap Synthesis",
      desc: "Real-time mapping of your current stack against live hiring benchmarks from Tier-1 tech firms."
    },
    {
      icon: Mic,
      title: "Native Audio Drills",
      desc: "Low-latency voice interviews powered by Gemini 2.5 for sub-second technical stress testing."
    }
  ];

  return (
    <div className="bg-[#020617] min-h-screen relative overflow-x-hidden font-sans selection:bg-indigo-500/30">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-8 animate-in fade-in slide-in-from-top-4 duration-1000">
           <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-500/20 transform group-hover:rotate-6 transition-all duration-500">CR</div>
              <span className="text-xl font-black text-white tracking-tighter font-display">CareerReadyAI</span>
           </div>
           
           <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
                className="px-8 py-3 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all active:scale-95"
              >
                Register
              </button>
           </div>
        </nav>

        {!showAuth ? (
          <div className="pt-24 pb-48">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black tracking-[0.25em] uppercase border border-indigo-500/20 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Sparkles size={12} className="animate-pulse" />
                <span>The Future of Career Intelligence</span>
              </div>
              
              <h1 className="text-6xl md:text-[120px] font-display font-black text-white tracking-tighter leading-[0.85] mb-12 overflow-hidden">
                <span className="block animate-in fade-in slide-in-from-bottom-full duration-1000 delay-100">Architect Your</span>
                <span className="block gradient-text animate-in fade-in slide-in-from-bottom-full duration-1000 delay-300">Dream Career.</span>
              </h1>
              
              <p className="max-w-2xl text-xl text-slate-400 font-medium leading-relaxed mb-16 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                Land your dream role with the world's most advanced AI-powered career navigator. 
                Analyze gaps, verify skills, and follow ultra-personalized roadmaps.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                <button 
                  onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
                  className="px-12 py-6 bg-white text-slate-900 rounded-[24px] font-black text-sm flex items-center gap-3 hover:bg-indigo-50 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl shadow-white/5 transition-all group"
                >
                  Get Started Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
                  className="px-12 py-6 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white rounded-[24px] font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div 
                  key={i} 
                  className="p-10 rounded-[40px] bg-slate-900/40 border border-white/5 backdrop-blur-sm group hover:border-indigo-500/30 hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
                  style={{ animationDelay: `${800 + (i * 150)}ms` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <f.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium text-sm">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Auth Section */
          <div className="max-w-md mx-auto pt-24 pb-48 animate-in zoom-in-95 duration-500">
            <div className="bg-[#0f172a]/80 backdrop-blur-2xl p-10 md:p-12 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Auth Toggle */}
              <div className="flex bg-black/20 p-1.5 rounded-2xl mb-12 border border-white/5">
                <button 
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${authMode === 'signin' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <LogIn size={14} /> Sign In
                </button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  <UserPlus size={14} /> Register
                </button>
              </div>

              <div className="text-center mb-10">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto mb-6">CR</div>
                <h2 className="text-3xl font-display font-black text-white tracking-tight mb-2">
                  {authMode === 'signin' ? 'Welcome Back.' : 'Create Account.'}
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  {authMode === 'signin' ? 'Access your career architecture.' : 'Start your journey to Tier-1 status.'}
                </p>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-relaxed flex items-start gap-3 animate-in shake">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{error.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 px-4 py-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-4 h-4 rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                    I agree to the <span className="text-indigo-400 underline decoration-indigo-500/30">Terms & Conditions</span>
                  </label>
                </div>

                <button 
                  onClick={handleFirebaseLogin}
                  disabled={isAuthenticating}
                  className={`w-full py-5 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group ${!agreedToTerms && 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  {isAuthenticating ? (
                    <Loader2 size={18} className="animate-spin text-indigo-600" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      {authMode === 'signin' ? 'Sign In with Google' : 'Register with Google'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform"></div>
                </button>
                
                <div className="flex items-center gap-3 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl text-[10px] font-bold text-indigo-400 leading-relaxed uppercase tracking-tight">
                  <ShieldCheck size={20} className="shrink-0" />
                  <span>Secure Firebase Auth 2.0 active. Your data is persisted to your private local vault.</span>
                </div>

                <button 
                  onClick={() => setShowAuth(false)}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  Cancel and Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="py-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-3 opacity-50">
              <div className="w-6 h-6 gradient-bg rounded-md flex items-center justify-center text-white font-black text-[10px]">CR</div>
              <span className="text-xs font-bold text-white tracking-tight">CareerReadyAI © 2024</span>
           </div>
           
           <div className="flex items-center gap-8">
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Security</a>
           </div>

           <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
                 <Github size={16} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
                 <Globe size={16} />
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;