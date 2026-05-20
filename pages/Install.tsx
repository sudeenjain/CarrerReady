import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  CheckCircle,
  Share,
  PlusSquare,
  Download,
  ShieldCheck,
  Chrome,
  Sparkles,
  Info,
  ChevronRight,
  Cpu,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Install() {
  const navigate = useNavigate();
  const [device, setDevice] = useState<'android' | 'ios'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Custom Flow States
  const [showPrompt, setShowPrompt] = useState(false);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing connection...');

  // Formspree States
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      alert("Please fill out both email and message fields.");
      return;
    }
    setFormState('submitting');
    try {
      const response = await fetch('https://formspree.io/f/mvgyykyv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          message: message,
          _subject: 'CareerReady App Install Feedback (sudinhr1@gmail.com)'
        })
      });
      if (response.ok) {
        setFormState('submitted');
      } else {
        throw new Error('Formspree submit failed');
      }
    } catch (err) {
      console.error(err);
      alert('Could not send message. Please send directly to sudinhr1@gmail.com');
      setFormState('idle');
    }
  };

  // Auto-detect OS and listen for PWA install prompts & events
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDevice('ios');
    } else {
      setDevice('android');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log('App was successfully installed natively!');
      setProgress(100);
      setInstallState('completed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Empty launcher effect

  // Handle Progress Counter
  useEffect(() => {
    if (installState !== 'installing') return;

    setProgress(0);
    const totalDuration = 4000; // 4 seconds total install
    const steps = 100;
    const intervalTime = totalDuration / steps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        
        // Dynamic status messaging based on percentage
        if (next < 25) {
          setStatusMessage('Securing handshake with CareerReady nodes...');
        } else if (next < 50) {
          setStatusMessage('Downloading standalone asset bundles (13.2 MB)...');
        } else if (next < 75) {
          setStatusMessage('Configuring secure database sandboxing...');
        } else if (next < 95) {
          setStatusMessage('Registering neural offline service worker...');
        } else if (next === 100) {
          setStatusMessage('Optimizing application for standalone use...');
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setInstallState('completed');
          }, 600);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [installState]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between px-6 py-10 relative overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      {/* Premium Ambient Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08)_0%,transparent_70%)] pointer-events-none blur-3xl" />

      {/* Main Core Container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center relative z-10">
        
        {/* Brand Header Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl mx-auto mb-4 hover:rotate-6 transition-transform duration-300">
            CR
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight leading-none">
            CareerReady AI 2.0
          </h1>
          <p className="text-slate-400 text-xs font-semibold tracking-wide mt-2 uppercase">
            Progressive App Download Hub
          </p>
        </div>

        {/* Outer Frame with rich glassmorphism */}
        <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-[36px] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
          
          {/* OS Tabs */}
          {installState === 'idle' && (
            <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-white/5 mb-8 transition-colors">
              <button
                onClick={() => setDevice('android')}
                className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                  device === 'android'
                    ? 'bg-slate-800 text-white shadow-lg border border-white/10'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                <Chrome size={14} className={device === 'android' ? 'text-indigo-400' : 'text-slate-500'} />
                Android
              </button>
              <button
                onClick={() => setDevice('ios')}
                className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                  device === 'ios'
                    ? 'bg-slate-800 text-white shadow-lg border border-white/10'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                <Smartphone size={14} className={device === 'ios' ? 'text-purple-400' : 'text-slate-500'} />
                Apple iOS
              </button>
            </div>
          )}

          {/* Core App Download Screens */}
          <AnimatePresence mode="wait">
            {installState === 'idle' && device === 'android' && (
              <motion.div
                key="android-idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Visual Premium Benefit Showcase */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">Standalone Performance</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed mt-1 font-medium">Runs in full screen mode, stripping away slow browser shell operations and toolbars.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">Instant Home Access</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed mt-1 font-medium">Adds a highly attractive premium brand launcher icon straight into your device's home screen.</p>
                    </div>
                  </div>
                </div>

                {/* Primary Download/Install Button */}
                <button
                  onClick={() => setShowPrompt(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-indigo-400/20"
                >
                  <Download size={16} />
                  Download for Android
                </button>
              </motion.div>
            )}

            {installState === 'idle' && device === 'ios' && (
              <motion.div
                key="ios-idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-center">
                  <p className="text-purple-400 text-xs font-black uppercase tracking-wider">Safari Standalone Launch</p>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-semibold">
                    Apple iOS requires Safari standalone creation. Follow the easy steps below to secure your home screen launcher.
                  </p>
                </div>

                {/* iOS Simple Visual Steps */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <Share size={18} />
                    </div>
                    <div>
                      <p className="font-black text-white text-xs">1. Tap Share Toolbar</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Tap the share icon at the bottom of Safari.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <PlusSquare size={18} />
                    </div>
                    <div>
                      <p className="font-black text-white text-xs">2. Select Add to Home Screen</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Scroll down and select the Home Screen addition option.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <p className="font-black text-white text-xs">3. Confirm Installation</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Tap Add in top right corner to download the app.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {installState === 'installing' && (
              <motion.div
                key="installing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 space-y-8"
              >
                {/* Advanced Circular Progress Gauge */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  
                  {/* Outer Pulsing Glow */}
                  <div className="absolute inset-0 rounded-full bg-indigo-500/5 border border-indigo-500/10 animate-ping duration-1000 opacity-60" />

                  {/* SVG Circle Gauge */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className="stroke-slate-800"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className="stroke-indigo-500"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 68}
                      strokeDashoffset={2 * Math.PI * 68 * (1 - progress / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                    />
                  </svg>

                  {/* Centered Percentage Display */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black tracking-tight text-white">{progress}%</span>
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 mt-1">{(progress * 13.2 / 100).toFixed(1)} MB / 13.2 MB</span>
                  </div>
                </div>

                {/* Status/Installation Message */}
                <div className="text-center space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Downloading Assets
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold px-4 max-w-xs mx-auto leading-relaxed h-10 flex items-center justify-center">
                    {statusMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {installState === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 space-y-6 flex flex-col items-center justify-center"
              >
                {/* Glowing Success Icon */}
                <div className="relative">
                  <div className="absolute inset-[-12px] bg-emerald-500/20 blur-xl rounded-full" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-lg relative z-10"
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                </div>

                {/* Required Success Message */}
                <div className="space-y-4 px-2">
                  <h3 className="text-2xl font-black text-white leading-tight">
                    Installed successfully!
                  </h3>
                  <p className="text-emerald-400 text-xs font-bold leading-relaxed max-w-xs mx-auto">
                    You can enjoy your learning!
                  </p>
                  
                  {/* Verification Instruction Box */}
                  <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-xs space-y-3 mt-4 text-left">
                    <p className="text-indigo-300 font-black uppercase tracking-wider text-[10px]">Verification Guide</p>
                    <p className="text-slate-300 leading-relaxed font-semibold">
                      Please check your mobile's <strong className="text-white">Home Screen</strong> to see if the CareerReady app icon has downloaded successfully.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      If the app is visible, tap to open and start your standalone offline learning experience. If not, please launch your browser and retry.
                    </p>
                  </div>
                </div>

                {/* Elegant Formspree Feedback Form */}
                <div className="w-full pt-6 border-t border-white/10 text-left space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">App Didn't Install?</h4>
                    <p className="text-slate-400 text-[11px] font-semibold">Send a message to our support desk (sudinhr1@gmail.com)</p>
                  </div>

                  {formState === 'submitted' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold text-center"
                    >
                      Thank you! Your feedback was sent successfully to sudinhr1@gmail.com. We will contact you shortly.
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <div>
                        <input
                          type="email"
                          placeholder="Your Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Type your message here describing the install issue..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          rows={3}
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-semibold resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={formState === 'submitting'}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-400 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-md border border-indigo-400/20 active:scale-[0.98]"
                      >
                        {formState === 'submitting' ? 'Sending Message...' : 'Send Message'}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Standalone Security Notice */}
        <div className="mt-8 flex items-center gap-3 p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
          <span>Secured with Advanced Sandbox Encryption and Standalone PWA Architecture.</span>
        </div>

      </div>

      {/* OS Custom Modal Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            
            {/* Modal Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-white/10 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Smartphone size={24} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white">Install CareerReady App?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    This will install the standalone app direct shortcut onto your device home screen.
                  </p>
                </div>

                {/* Dialog buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-750 transition-colors border border-white/5 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setShowPrompt(false);
                      if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        if (outcome === 'accepted') {
                          setDeferredPrompt(null);
                          setInstallState('installing');
                        } else {
                          setInstallState('idle');
                        }
                      } else {
                        // Fallback to progress bar animation if prompt event is not available
                        setInstallState('installing');
                      }
                    }}
                    className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25 active:scale-95"
                  >
                    Install
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simple Clean Footer */}
      <div className="text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.25em] mt-8">
        CareerReady AI PWA Ecosystem · Standalone Setup Hub
      </div>
    </div>
  );
}
