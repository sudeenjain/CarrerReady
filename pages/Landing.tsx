
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Cpu,
  Network,
  Mic,
  ShieldCheck,
  LogIn,
  Bot,
  Smartphone,
  Download,
  X,
  Mail,
  Phone,
  MessageCircle,
  Github,
  Linkedin,
  Instagram
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { ThemeToggle } from '../components/ThemeToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  // Footer Modal States
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

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
    },
    {
      icon: Bot,
      title: "Astra AI",
      desc: "Your empathetic personal career assistant. She builds a bond, guides your prep, and roots for you.",
      highlight: true
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
            <div className="w-px h-6 bg-[var(--border-color)]"></div>
            <ThemeToggle />
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

                      <div className="col-span-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/20 p-5 group hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                          <div className="flex items-end gap-1 h-3">
                            <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                            <div className="w-1 h-2 bg-indigo-500 rounded-full animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
                            <div className="w-1 h-full bg-indigo-500 rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
                          </div>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-200 font-black uppercase tracking-widest">
                            Astra • Personal Assistant
                          </p>
                        </div>
                        <p className="text-sm text-[var(--text-main)] font-bold mt-3 leading-relaxed relative z-10">
                          “Focus on 1 project + 2 interview patterns this week. I’ll generate a plan and track progress.”
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[var(--text-muted)] relative z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className={`p-8 rounded-[28px] backdrop-blur-sm group hover:-translate-y-1 hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 ${
                      (f as any).highlight 
                        ? 'bg-gradient-to-b from-indigo-500/10 to-transparent border-2 border-indigo-500/30 hover:border-indigo-400 hover:shadow-indigo-500/20' 
                        : 'bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-indigo-500/40 hover:bg-[var(--glass-bg)] hover:shadow-indigo-500/10'
                    }`}
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ${
                      (f as any).highlight ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    }`}>
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

            {/* Social Proof Stats */}
            <section className="pb-20 md:pb-24">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: '12,000+', label: 'Profiles Analyzed' },
                  { value: '45-Day', label: 'Roadmap Plans' },
                  { value: '8', label: 'Career Tracks' },
                  { value: '< 300ms', label: 'Voice Latency' },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-center">
                    <p className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight">{s.value}</p>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Cross-Device Handoff Section */}
            <section className="pb-20 md:pb-24">
              <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-[32px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_100%_0%,rgba(79,70,229,0.15)_0%,transparent_50%)] pointer-events-none"></div>
                
                <div className="max-w-xl relative z-10 text-center md:text-left space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-full text-[10px] font-black tracking-widest uppercase border border-indigo-500/20">
                    <Smartphone size={14} />
                    <span>Mobile Handoff</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-black text-[var(--text-main)] tracking-tight">
                    Take CareerReady <br className="hidden md:block" /> anywhere.
                  </h2>
                  <p className="text-[var(--text-muted)] text-sm md:text-base font-medium leading-relaxed">
                    Scan this QR code with your phone's camera to instantly download and install CareerReady as a standalone app on your Android or Apple iOS device.
                  </p>
                  <button
                    onClick={() => navigate('/install')}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_10px_25px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 active:scale-95 border border-indigo-400/20"
                  >
                    <Download size={14} />
                    Download PWA App
                  </button>
                </div>

                <div className="relative z-10 shrink-0 p-5 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)] transition-all duration-500">
                  <QRCode 
                    value={`${window.location.origin}/#/install`} 
                    size={160}
                    level="H"
                    fgColor="#1e1e2f"
                    bgColor="#ffffff"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                  <div className="mt-4 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scan to Install</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[var(--border-color)] py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              <p>© 2026 CareerReadyAI · Built with Gemini 2.5</p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setShowPrivacyModal(true)} 
                  className="hover:text-[var(--text-main)] transition-colors cursor-pointer font-black"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => setShowTermsModal(true)} 
                  className="hover:text-[var(--text-main)] transition-colors cursor-pointer font-black"
                >
                  Terms
                </button>
                <button 
                  onClick={() => setShowContactModal(true)} 
                  className="hover:text-[var(--text-main)] transition-colors cursor-pointer font-black"
                >
                  Contact
                </button>
              </div>
            </footer>
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

      {/* --- Footer Modals System --- */}

      {/* 1. Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div 
            className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative text-left scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent animate-in zoom-in-95 duration-300"
          >
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-xs md:text-sm">
              <div className="border-b border-white/10 pb-4">
                <h1 className="text-xl font-display font-black text-white uppercase tracking-tight">Privacy Policy – CareerReady AI</h1>
                <p className="text-slate-500 font-bold mt-1 text-[11px]">Last Updated: May 20, 2026</p>
              </div>

              <p className="leading-relaxed font-semibold">
                Welcome to CareerReady AI. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information while using our platform.
              </p>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">1. Information We Collect</h2>
                <p className="font-semibold">CareerReady AI may collect:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-semibold text-slate-400">
                  <li>Name and Email Address</li>
                  <li>Resume files uploaded for analysis</li>
                  <li>GitHub username</li>
                  <li>LinkedIn text/profile content</li>
                  <li>Career benchmark selection</li>
                  <li>Skills and analytics data</li>
                  <li>Interview scores and progress reports</li>
                  <li>Feedback submitted through the platform</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">2. Why We Collect Your Data</h2>
                <p className="font-semibold">We collect data to:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-semibold text-slate-400">
                  <li>Analyze user skills</li>
                  <li>Generate personalized career roadmaps</li>
                  <li>Compare skills with industry benchmarks</li>
                  <li>Recommend jobs and opportunities</li>
                  <li>Improve interview readiness</li>
                  <li>Create ATS-friendly resumes</li>
                  <li>Enhance user experience</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">3. Data Security</h2>
                <p className="font-semibold leading-relaxed text-slate-400">
                  We take reasonable steps to protect your information using secure authentication and database protection practices.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">4. Third-Party Services</h2>
                <p className="font-semibold leading-relaxed text-slate-400">
                  CareerReady AI may use third-party services such as Firebase Authentication, GitHub APIs, YouTube APIs, and AI services for platform functionality.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">5. User Rights</h2>
                <p className="font-semibold">Users can:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-semibold text-slate-400">
                  <li>Update personal information</li>
                  <li>Request deletion of data</li>
                  <li>Remove uploaded resumes</li>
                  <li>Stop using the platform anytime</li>
                </ul>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">6. Contact Us</h2>
                <p className="font-semibold text-slate-400">
                  If you have any questions regarding privacy, contact:
                </p>
                <p className="font-black text-indigo-400">
                  Email: <a href="mailto:sudinhr1@gmail.com" className="hover:underline">sudinhr1@gmail.com</a>
                </p>
              </div>

              <p className="text-center font-black text-slate-400 uppercase tracking-widest text-[11px] pt-4">
                By using CareerReady AI, you agree to this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div 
            className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative text-left scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent animate-in zoom-in-95 duration-300"
          >
            <button 
              onClick={() => setShowTermsModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-xs md:text-sm">
              <div className="border-b border-white/10 pb-4">
                <h1 className="text-xl font-display font-black text-white uppercase tracking-tight">Terms & Conditions – CareerReady AI</h1>
                <p className="text-slate-500 font-bold mt-1 text-[11px]">Last Updated: May 20, 2026</p>
              </div>

              <p className="leading-relaxed font-semibold">
                Welcome to CareerReady AI. By accessing or using this platform, you agree to follow these Terms and Conditions.
              </p>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">1. Purpose of the Platform</h2>
                <p className="font-semibold leading-relaxed text-slate-400">
                  CareerReady AI is designed to help students and job seekers improve career readiness through skill analysis, AI interviews, roadmaps, and job recommendations.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">2. User Responsibilities</h2>
                <p className="font-semibold">Users agree to:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-semibold text-slate-400">
                  <li>Provide accurate information</li>
                  <li>Use the platform responsibly</li>
                  <li>Avoid misuse, spam, or harmful activities</li>
                  <li>Upload only appropriate content</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">3. AI Recommendations Disclaimer</h2>
                <p className="font-semibold leading-relaxed text-slate-400 text-slate-400">
                  CareerReady AI provides AI-generated recommendations and readiness analysis. Results are guidance-based and do not guarantee job placement or employment.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">4. Intellectual Property</h2>
                <p className="font-semibold leading-relaxed text-slate-400">
                  All platform content, UI, branding, and features belong to CareerReady AI unless otherwise stated.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">5. Account Usage</h2>
                <p className="font-semibold leading-relaxed text-slate-400">
                  Users are responsible for maintaining account security and login credentials.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">6. Feature Updates</h2>
                <p className="font-semibold leading-relaxed text-slate-400">
                  CareerReady AI may update features, tools, and policies to improve platform experience.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">7. Termination</h2>
                <p className="font-semibold leading-relaxed text-slate-400">
                  Accounts violating platform rules may be restricted or removed.
                </p>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">8. Contact Information</h2>
                <p className="font-semibold text-slate-400">
                  For support or queries:
                </p>
                <p className="font-black text-indigo-400">
                  Email: <a href="mailto:sudinhr1@gmail.com" className="hover:underline">sudinhr1@gmail.com</a>
                </p>
              </div>

              <p className="text-center font-black text-slate-400 uppercase tracking-widest text-[11px] pt-4">
                By using CareerReady AI, you agree to these Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Contact Information Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
          <div 
            className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative text-left animate-in zoom-in-95 duration-300"
          >
            <button 
              onClick={() => setShowContactModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Mail className="text-indigo-400" size={22} />
                  Get in Touch
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">We're here to help you get CareerReady.</p>
              </div>

              {/* Clickable channels list */}
              <div className="space-y-3.5">
                {/* Email Address */}
                <a 
                  href="mailto:sudinhr1@gmail.com"
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                    <p className="text-xs font-black text-white tracking-wide mt-0.5">sudinhr1@gmail.com</p>
                  </div>
                </a>

                {/* Phone Call */}
                <a 
                  href="tel:+918762862509"
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Call</p>
                    <p className="text-xs font-black text-white tracking-wide mt-0.5">+91 8762862509</p>
                  </div>
                </a>

                {/* WhatsApp Chat */}
                <a 
                  href="https://wa.me/918762862509"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Direct WhatsApp</p>
                    <p className="text-xs font-black text-white tracking-wide mt-0.5">+91 8762862509</p>
                  </div>
                </a>

                {/* Interactive Social Handles Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <a 
                    href="https://github.com/sudeenjain" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/5 hover:border-white/10 transition-colors text-slate-400 hover:text-white gap-2 text-center group"
                  >
                    <Github size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-wider">GitHub</span>
                  </a>

                  <a 
                    href="https://www.linkedin.com/in/sudeenjain" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/5 hover:border-white/10 transition-colors text-slate-400 hover:text-white gap-2 text-center group"
                  >
                    <Linkedin size={18} className="group-hover:scale-110 transition-transform text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-wider">LinkedIn</span>
                  </a>

                  <a 
                    href="https://instagram.com/sudeenjain" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/5 hover:border-white/10 transition-colors text-slate-400 hover:text-white gap-2 text-center group"
                  >
                    <Instagram size={18} className="group-hover:scale-110 transition-transform text-pink-400" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
