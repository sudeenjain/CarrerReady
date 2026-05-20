import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, Globe, Github, Smartphone, User } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch, setTokens } from "../src/api/client";
import {
  auth,
  googleProvider,
  githubProvider,
} from "../firebase";
import {
  signInWithPopup,
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { sendWelcomeEmail } from "../src/utils/emailService";

type AuthMode = "login" | "register";

export default function Auth({ onAuthenticated }: { onAuthenticated: (me: { name: string; email: string }) => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "register" && fullName.trim().length < 2) return false;
    return true;
  }, [email, password, fullName, mode]);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const token = await apiFetch<{ access_token: string; refresh_token: string }>(
        mode === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify(
            mode === "login"
              ? { email, password }
              : { email, password, full_name: fullName }
          ),
        }
      );
      setTokens(token.access_token, token.refresh_token);

      const me = await apiFetch<{ email: string; full_name?: string | null }>(
        "/api/v1/users/me",
        { method: "GET" }
      );
      onAuthenticated({
        email: me.email,
        name: me.full_name || me.email.split("@")[0],
      });
      sendWelcomeEmail(me.email, me.full_name || me.email.split("@")[0]);
      navigate("/onboarding");
    } catch (e: any) {
      setError(e?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // social / external auth helpers
  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onAuthenticated({ name: user.displayName || "", email: user.email || "" });
      sendWelcomeEmail(user.email || "", user.displayName || "User");
      navigate("/onboarding");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGithub = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      onAuthenticated({ name: user.displayName || "", email: user.email || "" });
      sendWelcomeEmail(user.email || "", user.displayName || "User");
      navigate("/onboarding");
    } catch (err: any) {
      setError(err?.message || "GitHub sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      onAuthenticated({ name: "Guest", email: "" });
      navigate("/onboarding");
    } catch (err: any) {
      setError(err?.message || "Anonymous sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePhone = async () => {
    setLoading(true);
    setError(null);
    try {
      const phoneNumber = prompt("Enter your phone number (e.g. +15555551234):");
      if (!phoneNumber) throw new Error("Phone number required");
      // invisible recaptcha container added at bottom
      const verifier = new RecaptchaVerifier(
        "recaptcha-container" as any,
        { size: "invisible" } as any,
        auth
      ) as any;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      const code = prompt("Enter the verification code you received:");
      if (!code) throw new Error("Verification code required");
      const userCredential = await confirmation.confirm(code);
      const user = userCredential.user;
      onAuthenticated({ name: user.displayName || "", email: user.phoneNumber || "" });
      sendWelcomeEmail(user.phoneNumber || "", user.displayName || "User");
      navigate("/onboarding");
    } catch (err: any) {
      setError(err?.message || "Phone sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center px-6 py-16 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(79,70,229,0.18)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_60%,rgba(124,58,237,0.14)_0%,transparent_55%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md glass-prestige rounded-[32px] p-8 md:p-10 relative z-10"
      >
        {/* invisible reCAPTCHA for phone auth */}
        <div id="recaptcha-container" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">CareerReady AI 2.0</p>
            <h1 className="text-2xl font-display font-black tracking-tight mt-2 transition-colors">
              {mode === "login" ? "Secure sign in" : "Create your account"}
            </h1>
          </div>
          <div className="w-11 h-11 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="flex gap-2 p-1.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] mb-8 transition-colors">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease ${mode === "login"
                ? "bg-[var(--glass-bg)] text-[var(--text-main)] shadow-md border border-[var(--border-color)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent"
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease ${mode === "register"
                ? "bg-[var(--glass-bg)] text-[var(--text-main)] shadow-md border border-[var(--border-color)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent"
              }`}
          >
            Register
          </button>
        </div>

        {/* social / providers section */}
        <div className="space-y-4 mb-8">
          <p className="text-center text-xs text-[var(--text-muted)] font-black uppercase tracking-widest">Sign in with</p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={handleGoogle}
              className="w-full bg-[var(--input-bg)] text-[var(--text-main)] px-5 py-3.5 rounded-2xl border border-[var(--border-color)] font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 ease hover:bg-[var(--glass-bg)] hover:border-indigo-500/40 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Globe size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              Continue with Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={handleGithub}
              className="w-full bg-[var(--input-bg)] text-[var(--text-main)] px-5 py-3.5 rounded-2xl border border-[var(--border-color)] font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 ease hover:bg-[var(--glass-bg)] hover:border-indigo-500/40 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Github size={18} className="text-[var(--text-muted)] group-hover:scale-110 transition-transform" />
              Continue with GitHub
            </motion.button>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={handlePhone}
                className="flex-1 bg-[var(--input-bg)] text-[var(--text-main)] px-5 py-3.5 rounded-2xl border border-[var(--border-color)] font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ease hover:bg-[var(--glass-bg)] hover:border-indigo-500/40 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Smartphone size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                Phone
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={handleAnonymous}
                className="flex-1 bg-[var(--input-bg)] text-[var(--text-main)] px-5 py-3.5 rounded-2xl border border-[var(--border-color)] font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ease hover:bg-[var(--glass-bg)] hover:border-indigo-500/40 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <User size={18} className="text-teal-400 group-hover:scale-110 transition-transform" />
                Guest
              </motion.button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full px-5 py-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300 shadow-inner"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-5 py-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300 shadow-inner"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-5 py-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300 shadow-inner"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="relative overflow-hidden w-full bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed group border border-indigo-400/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer transition-none mix-blend-overlay"></div>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Authenticating
              </>
            ) : (
              <>
                <span className="relative z-10 tracking-wide uppercase">Continue</span>
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </div>

        <p className="mt-8 text-center text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-80">
          JWT • PostgreSQL • Redis • OpenAI
        </p>
      </motion.div>
    </div>
  );
}

