import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  CheckCircle,
  Share,
  PlusSquare,
  ArrowRight,
  Download,
  ShieldCheck,
  Chrome,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Install() {
  const navigate = useNavigate();
  const [device, setDevice] = useState<'android' | 'ios' | 'desktop'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) {
      setDevice('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDevice('ios');
    } else {
      setDevice('desktop');
    }

    // 2. Listen for native PWA beforeinstallprompt event (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerNativeInstall = async () => {
    if (!deferredPrompt) {
      // Fallback instruction trigger
      alert("Native installation prompt isn't ready. Please use the browser menu (⋮) -> 'Install App' or 'Add to Home Screen' to download!");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between px-6 py-10 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(79,70,229,0.18)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_60%,rgba(124,58,237,0.12)_0%,transparent_55%)] pointer-events-none" />

      {/* Main Content Area */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto mb-4 animate-bounce">
            CR
          </div>
          <h1 className="text-3xl font-display font-black text-[var(--text-main)] tracking-tight leading-none">
            Install CareerReady App
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-semibold mt-2">
            Get the native app experience directly on your device
          </p>
        </div>

        {/* Outer Frame */}
        <div className="glass-prestige rounded-[32px] p-6 border border-[var(--border-color)] relative">
          
          {/* OS Selector Tabs */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] mb-6 transition-colors">
            <button
              onClick={() => setDevice('android')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease ${
                device === 'android'
                  ? 'bg-[var(--glass-bg)] text-[var(--text-main)] shadow-md border border-[var(--border-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
              }`}
            >
              <Chrome size={14} className="text-indigo-400" />
              Android
            </button>
            <button
              onClick={() => setDevice('ios')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease ${
                device === 'ios'
                  ? 'bg-[var(--glass-bg)] text-[var(--text-main)] shadow-md border border-[var(--border-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
              }`}
            >
              <Smartphone size={14} className="text-purple-400" />
              Apple iOS
            </button>
          </div>

          {/* Content Switching */}
          <AnimatePresence mode="wait">
            {isInstalled ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-6"
                key="installed"
              >
                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">App Fully Installed!</h3>
                  <p className="text-slate-400 text-xs mt-2 font-medium">
                    You can now open CareerReady AI 2.0 directly from your home screen just like a regular app!
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                >
                  Enter Portal <ArrowRight size={14} />
                </button>
              </motion.div>
            ) : device === 'android' ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
                key="android"
              >
                {/* Visual Phone frame demo */}
                <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Sparkles size={14} />
                    <span>Native Standalone Mode</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-semibold">
                    Android devices support direct application download. Once installed, it will reside in your App Drawer and run outside of your web browser frame.
                  </p>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={triggerNativeInstall}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-indigo-400/20"
                >
                  <Download size={16} />
                  Download for Android
                </button>

                {/* Step-by-step Instructions Accordion */}
                <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <Info size={12} /> Alternative manual setup
                  </h4>
                  <div className="space-y-2 text-xs text-slate-400 font-medium">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">1</span>
                      <p>Open this page inside <strong className="text-white">Google Chrome</strong>.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">2</span>
                      <p>Tap the <strong className="text-white">three dots menu (⋮)</strong> in Chrome's top-right corner.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">3</span>
                      <p>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
                key="ios"
              >
                {/* Apple / iOS Share Guidance Banner */}
                <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Sparkles size={14} />
                    <span>Safari App Shell</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-semibold">
                    Apple iOS requires Safari to initialize home screen downloads. Follow the fast guidelines below to create your CareerReady app icon.
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Safari Setup Instructions</h4>
                  
                  <div className="space-y-3.5 text-xs text-slate-300 font-medium">
                    <div className="flex items-start gap-3 bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <Share size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-white mb-0.5">Step 1</p>
                        <p className="text-slate-400 text-xs">Tap the <strong className="text-purple-400">Share</strong> button at the bottom of the Safari toolbar.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <PlusSquare size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-white mb-0.5">Step 2</p>
                        <p className="text-slate-400 text-xs">Scroll down and select <strong className="text-purple-400">"Add to Home Screen"</strong> from the options.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-white mb-0.5">Step 3</p>
                        <p className="text-slate-400 text-xs">Tap <strong className="text-purple-400">"Add"</strong> in the top-right corner of Safari. Launch the app!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Safari automatically bundles the PWA standalone asset.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Benefits notice */}
        <div className="mt-6 flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
          <ShieldCheck size={16} className="shrink-0" />
          <span>Standalone layout removes browser tab headers, increases performance and enables quick launching</span>
        </div>

      </div>

      {/* Mini Footer */}
      <div className="text-center text-[10px] text-slate-600 font-black uppercase tracking-widest mt-8">
        CareerReady AI PWA App Deployment · Version 2.0
      </div>
    </div>
  );
}
