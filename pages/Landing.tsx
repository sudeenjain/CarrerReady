import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Cpu, 
  Network, 
  Mic, 
  ShieldCheck, 
  Loader2, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Landing: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFirebaseLogin = async () => {
    if (!agreedToTerms) {
      setError("You must agree to the terms to proceed.");
      return;
    }
    
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin({
        name: result.user.displayName || 'Architect',
        email: result.user.email || '',
        picture: result.user.photoURL || ''
      });
      navigate('/onboarding');
    } catch (err: any) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const features = [
    { icon: Cpu, title: "Neural Mapping", desc: "Understand your technical DNA through deep repository analysis." },
    { icon: Network, title: "Market Pulse", desc: "Real-time synchronization with global hiring benchmarks." },
    { icon: Mic, title: "Audio Intelligence", desc: "Sub-second latency technical stress testing via Gemini 2.5." }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setShowLogin(false)}>
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center text-black font-black text-[10px]">CR</div>
          <span className="text-sm font-bold tracking-tighter uppercase">CareerReady</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setShowLogin(true)} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Sign In</button>
          <button onClick={() => setShowLogin(true)} className="px-5 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all">Initiate</button>
        </div>
      </nav>

      {!showLogin ? (
        <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center py-20 space-y-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
              <Zap size={10} className="text-white/60" />
              Intelligence for the Future of Work
            </div>
            
            <h1 className="text-6xl md:text-[120px] font-black tracking-tighter leading-[0.9] x-gradient-text">
              Understand the <br /> Universe of Careers.
            </h1>
            
            <p className="max-w-xl text-lg text-white/50 font-medium leading-relaxed">
              The world's most advanced AI career navigator. <br />
              Analyze gaps. Verify skills. Follow the roadmap.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
              <button 
                onClick={() => setShowLogin(true)}
                className="px-10 py-4 bg-white text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-3"
              >
                Start Analysis <ArrowRight size={14} />
              </button>
              <button 
                onClick={() => setShowLogin(true)}
                className="px-10 py-4 border border-white/10 text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
              >
                View Manifesto
              </button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 mt-20">
            {features.map((f, i) => (
              <div key={i} className="p-12 bg-black group hover:bg-white/[0.02] transition-all">
                <f.icon size={24} className="text-white/40 mb-8 group-hover:text-white transition-colors" />
                <h3 className="text-lg font-bold mb-4 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-40 pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <span>© 2024 CareerReady AI</span>
              <span className="w-1 h-1 bg-white/10 rounded-full"></span>
              <span>Built for the Elite</span>
            </div>
            <div className="flex items-center gap-8 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </main>
      ) : (
        <div className="min-h-screen flex items-center justify-center px-8 animate-in fade-in duration-500">
          <div className="w-full max-w-md space-y-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-black font-black text-xl mx-auto mb-8">CR</div>
              <h2 className="text-3xl font-black tracking-tighter">Initiate Protocol.</h2>
              <p className="text-white/40 text-sm font-medium">Synchronize your identity to access the neural engine.</p>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 px-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-4 h-4 rounded-none border-white/20 bg-black text-white focus:ring-0 cursor-pointer"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="text-[9px] font-bold text-white/40 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                  I accept the <span className="text-white underline underline-offset-4">Operational Terms</span>
                </label>
              </div>

              <button 
                onClick={handleFirebaseLogin}
                disabled={isAuthenticating || !agreedToTerms}
                className={`w-full py-5 bg-white text-black font-bold text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${(!agreedToTerms || isAuthenticating) ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-white/90'}`}
              >
                {isAuthenticating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Sign In with Google <ArrowRight size={14} /></>
                )}
              </button>

              <button 
                onClick={() => setShowLogin(false)}
                className="w-full py-5 border border-white/10 text-white font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>

            <div className="pt-12 text-center">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Secure Neural Link v2.5</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;