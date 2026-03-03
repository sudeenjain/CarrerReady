
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Cpu,
  Network,
  Mic,
  ShieldCheck,
  LogIn
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const scrollToSection = (id: string) => {
    if (showLogin) {
      setShowLogin(false);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="bg-[var(--bg-main)] min-h-screen relative overflow-x-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.12)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <nav className="flex items-center justify-between py-6 mt-6 px-8 rounded-full bg-[var(--nav-bg)] border border-[var(--border-color)] shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-105 duration-500">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20 tracking-tighter group-hover:rotate-6 transition-transform">CR</div>
            <span className="text-lg font-black text-[var(--text-main)] tracking-tight font-display transition-colors">CareerReadyAI</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <button
              onClick={() => scrollToSection('hero-section')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:tracking-[0.3em] transition-all duration-500"
            >
              Manifesto
            </button>
            <button
              onClick={() => scrollToSection('features-section')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:tracking-[0.3em] transition-all duration-500"
            >
              Technology
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-2.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] font-black text-[10px] uppercase tracking-widest hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 border border-[var(--bg-main)]"
            >
              Sign In
            </button>
          </div>
        </nav>

        {!showLogin ? (
          <div className="animate-in fade-in duration-1000">
            <section id="hero-section" className="pt-20 md:pt-28 pb-24 md:pb-28">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/5 text-indigo-300 rounded-full text-[10px] font-black tracking-[0.18em] uppercase border border-indigo-500/20 mb-8 shadow-[0_0_20px_rgba(79,70,229,0.08)] animate-in slide-in-from-bottom-4 duration-700">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>AI career workspace</span>
                  </div>

                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-[var(--text-main)] tracking-tight leading-[1.05] mb-6 animate-in slide-in-from-bottom-8 duration-700 transition-colors">
                    Build a
                    <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 dark:from-indigo-200 dark:via-white dark:to-slate-300 bg-clip-text text-transparent"> job‑ready </span>
                    profile—faster.
                  </h1>

                  <p className="max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-[var(--text-muted)] font-medium leading-relaxed mb-10 animate-in fade-in duration-700 delay-150 transition-colors">
                    Skill verification, gap analysis, roadmaps, and interview drills in one professional dashboard.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-in fade-in duration-700 delay-300">
                    <button
                      onClick={() => setShowLogin(true)}
                      className="px-8 py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all outline-none border border-[var(--border-color)] group"
                    >
                      Get started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => scrollToSection('features-section')}
                      className="px-8 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--glass-bg)] hover:-translate-y-0.5 transition-all shadow-sm"
                    >
                      See features
                    </button>
                  </div>

                  <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    <span className="px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)]">Resume</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)]">GitHub</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)]">Roadmap</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)]">Interview</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-6 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.22)_0%,transparent_60%)] blur-2xl pointer-events-none"></div>
                  <div className="bg-[var(--glass-bg)] backdrop-blur-3xl rounded-[32px] border border-[var(--border-color)] shadow-[var(--card-shadow)] overflow-hidden transition-all duration-500 relative z-10">
                    <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">CareerReadyAI</p>
                        <p className="text-sm text-[var(--text-main)] font-black tracking-tight mt-1">Readiness overview</p>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-300">
                        <LogIn size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] p-5">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Readiness</p>
                        <p className="text-3xl font-black text-[var(--text-main)] tracking-tight mt-2">72%</p>
                        <p className="text-[10px] text-emerald-500 dark:text-green-400 font-black uppercase tracking-widest mt-3">+6 this week</p>
                      </div>
                      <div className="rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] p-5">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Next unlock</p>
                        <p className="text-lg font-black text-[var(--text-main)] tracking-tight mt-2">TypeScript</p>
                        <p className="text-[10px] text-indigo-500 dark:text-indigo-300 font-black uppercase tracking-widest mt-3">Roadmap day 8</p>
                      </div>

                      <div className="col-span-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/20 p-5">
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-200 font-black uppercase tracking-widest">AI mentor</p>
                        <p className="text-sm text-[var(--text-main)] font-bold mt-2 leading-relaxed">
                          “Focus on 1 project + 2 interview patterns this week. I’ll generate a plan and track progress.”
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[var(--text-muted)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="features-section" className="py-20 md:py-24">
              <div className="flex items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-300">What you get</p>
                  <h2 className="text-3xl md:text-4xl font-display font-black text-[var(--text-main)] tracking-tight mt-2 transition-colors">A premium workflow, end‑to‑end</h2>
                </div>
                <div className="hidden md:block text-right text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Built for consistency • built for hiring
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-[28px] bg-[var(--input-bg)] border border-[var(--input-border)] backdrop-blur-sm group hover:border-indigo-500/40 hover:-translate-y-1 hover:bg-[var(--glass-bg)] hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <f.icon size={24} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-main)] mb-3 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed font-medium text-sm">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-md mx-auto pt-48 animate-in zoom-in-95 duration-500 mb-48">
            <div className="bg-[var(--glass-bg)] backdrop-blur-2xl p-10 md:p-14 rounded-[40px] border border-[var(--border-color)] shadow-2xl relative text-center group">
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-8 right-8 text-[var(--text-muted)] hover:text-[var(--text-main)] font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                Back
              </button>

              <div className="mb-12">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500">CR</div>
                <h2 className="text-3xl font-display font-black text-[var(--text-main)] tracking-tight mb-2">Activate Profile</h2>
                <p className="text-[var(--text-muted)] text-sm font-medium">Sign in to continue your personalized career roadmap, skill tracking, and placement preparation journey.</p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-5 rounded-2xl bg-[var(--text-main)] text-[var(--bg-main)] font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-[1px] transition-all active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group/btn border border-transparent"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <LogIn size={18} className="text-[var(--bg-main)] opacity-80" />
                    Sign In to CareerReadyAI
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer transition-transform"></div>
                </button>

                <div className="flex items-center gap-3 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl text-[10px] font-bold text-indigo-600 dark:text-indigo-400 leading-relaxed uppercase tracking-tight text-left transition-colors">
                  <ShieldCheck size={20} className="shrink-0" />
                  <span>🔐 Secure login enabled. Your data and progress are safely stored and synchronized in real time</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
