
import React, { useMemo, useState } from 'react';
import { UserProfile, RoadmapStep } from '../types';
import { ReadinessScoreGauge } from '../components/ReadinessScoreGauge';
import { calculateReadinessScore } from '../utils/scoreCalculator';
import { JOB_ROLES } from '../constants';
import { SkillCoverageChart } from '../components/SkillCoverageChart';
import { Zap, Trophy, ChevronRight, Plus, Github, Flame, ShieldCheck, Sparkles, Star, TrendingUp, BrainCircuit, Loader2, Copy, FileText, LayoutTemplate, CheckCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC<{
  user: UserProfile,
  onOpenUpload: () => void,
  onOpenGitHub: () => void
}> = ({ user, onOpenUpload, onOpenGitHub }) => {
  const role = JOB_ROLES.find(r => r.title === user.targetRole) || JOB_ROLES[0];
  const [githubLinks, setGithubLinks] = useState('');
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<{ resumeSnippet: string; portfolioSnippet: string } | null>(null);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedPortfolio, setCopiedPortfolio] = useState(false);

  const handleGenerateAssets = async () => {
    if (!githubLinks.trim()) return;
    setIsGeneratingAssets(true);
    try {
      const { analysisService } = await import('../analysisService');
      const links = githubLinks.split(',').map(l => l.trim()).filter(Boolean);
      const res = await analysisService.generateAssetsFromGitHub(links);
      setGeneratedAssets(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  const copyToClipboard = (text: string, type: 'resume' | 'portfolio') => {
    navigator.clipboard.writeText(text);
    if (type === 'resume') {
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    } else {
      setCopiedPortfolio(true);
      setTimeout(() => setCopiedPortfolio(false), 2000);
    }
  };

  const exportResumeToPDF = async () => {
    if (!generatedAssets?.resumeSnippet) return;

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #111;">
        <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 5px; color: #1e1e2f;">${user.name}</h1>
        <h2 style="font-size: 18px; color: #4f46e5; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px;">${user.targetRole}</h2>
        <hr style="border: 0; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px;" />
        <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #334155;">${generatedAssets.resumeSnippet}</div>
      </div>
    `;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 1,
        filename: `${user.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      // @ts-expect-error: html2pdf.js has some typing issues, but it works at runtime
      html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("PDF Export failed", e);
    }
  };

  // Dynamically calculate total steps from saved roadmap to ensure score accuracy
  const roadmapData = useMemo(() => {
    // Corrected to use the roadmap_daily_ key which matches Roadmap.tsx storage logic
    const saved = localStorage.getItem(`roadmap_daily_${user.targetRole}`);
    if (saved) {
      try {
        const steps: RoadmapStep[] = JSON.parse(saved);
        // Corrected: Total count is now the number of days in the roadmap array as per current schema
        const total = steps.length;
        return { total, steps };
      } catch (e) {
        return { total: 45, steps: [] };
      }
    }
    return { total: 45, steps: [] };
  }, [user.targetRole]);

  // Filter completed steps to only those present in current roadmap to prevent score inflation
  const validCompletedCount = useMemo(() => {
    // Corrected: completion keys are now 'day-X' strings, matching Roadmap.tsx toggle logic and storage keys
    if (roadmapData.steps.length === 0) return (user.completedResources || []).filter(k => k.startsWith('day-')).length;
    const currentKeys = roadmapData.steps.map(s => `day-${s.day}`);
    return (user.completedResources || []).filter(k => currentKeys.includes(k)).length;
  }, [roadmapData, user.completedResources]);

  const breakdown = calculateReadinessScore(
    user.currentSkills,
    role.requirements,
    validCompletedCount,
    roadmapData.total
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-up duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mastery Overview */}
        <div className="lg:col-span-2 bg-[var(--glass-bg)] backdrop-blur-xl rounded-[40px] p-10 border border-[var(--border-color)] shadow-2xl relative overflow-hidden group transition-all duration-500">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-[var(--text-main)] group-hover:scale-110 transition-transform pointer-events-none">
            <Sparkles size={180} />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="w-56 h-56 shrink-0 relative">
              <ReadinessScoreGauge score={breakdown.total} />
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-emerald-600 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 border border-green-500/20">
                  Neural Scan Synchronized
                </div>
                <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter mb-2 transition-colors">Architect Progress, {user.name.split(' ')[0]}</h3>
                <p className="text-[var(--text-muted)] text-lg font-medium leading-relaxed transition-colors">
                  Your <span className="text-[var(--text-main)]">Mastery Score</span> is strictly cumulative. You have unlocked <span className="text-indigo-600 dark:text-indigo-400 font-bold">{breakdown.total}%</span> of the {user.targetRole} ecosystem.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 shadow-sm transition-colors">
                  <Flame size={14} />
                  <span>{user.streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-[var(--input-bg)] text-[var(--text-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[var(--border-color)] shadow-sm transition-colors">
                  <Star size={14} className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                  <span>Level {Math.floor(breakdown.total / 10)} Seeker</span>
                </div>
              </div>

              {/* Radar Chart identifying comparative readiness */}
              <SkillCoverageChart user={user} role={role} />
            </div>
          </div>
        </div>

        {/* Global XP Stats & Evidence Sync */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-[var(--glass-bg)] rounded-[32px] p-8 text-[var(--text-main)] shadow-2xl border border-[var(--border-color)] relative overflow-hidden group transition-all duration-500">
            <div className="absolute -bottom-4 -right-4 opacity-[0.05] dark:opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={100} />
            </div>
            <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-6 transition-colors">Total Achievement XP</h4>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black">{breakdown.total * 12}</span>
              <span className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest transition-colors">Points</span>
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-between transition-colors">
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest italic transition-colors">Industry Ready Velocity</p>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-green-400">
                <TrendingUp size={12} />
                <span className="text-[10px] font-black">Accelerated</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenGitHub}
            className="bg-[var(--glass-bg)] backdrop-blur-md rounded-[32px] p-6 border border-[var(--border-color)] hover:border-indigo-500/40 hover:shadow-lg transition-all group text-left w-full"
          >
            <h4 className="font-black text-[var(--text-main)] text-[10px] uppercase tracking-widest mb-4 ml-1 flex items-center gap-2 transition-colors">
              <Github size={14} className="group-hover:rotate-12 transition-transform" /> Evidence Pulse
            </h4>
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--text-main)] transition-colors">GitHub AI Verification</p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium transition-colors">Deep-scan repositories to verify technical expertise signals.</p>
              <div className="flex items-center gap-1.5 pt-2 text-indigo-600 dark:text-indigo-400 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">Sync Evidence</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          <Link to="/intelligence" className="bg-[var(--glass-bg)] backdrop-blur-md rounded-[32px] p-6 border border-[var(--border-color)] hover:border-indigo-500/40 hover:shadow-lg transition-all group">
            <h4 className="font-black text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest mb-4 ml-1 flex items-center gap-2 transition-colors">
              <BrainCircuit size={14} /> Strategic Intelligence
            </h4>
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--text-main)] transition-colors">AI Ensemble Ready</p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium transition-colors">Explore the Multi-Model Roadmap and Skill Decay predictions.</p>
              <div className="flex items-center gap-1.5 pt-2 text-indigo-600 dark:text-indigo-400 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">View Blueprint</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Achievements List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-2xl font-black text-[var(--text-main)] tracking-tighter transition-colors">Verified Masteries</h4>
            <Link to="/analysis" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-[var(--text-main)] transition-colors">Audit All Skills</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.currentSkills.slice(0, 6).map((skill, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-between group hover:bg-[var(--glass-bg)] hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{skill.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest mt-1 transition-colors">Verified via {skill.source}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-[var(--glass-bg)] rounded-lg text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-[var(--border-color)] transition-colors">
                  {skill.level}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Unlocks */}
        <div className="space-y-8">
          <h4 className="text-2xl font-black text-[var(--text-main)] tracking-tighter px-2 transition-colors">Next Unlocks</h4>
          <div className="space-y-4">
            {role.requirements.filter(req => !user.currentSkills.some(s => s.name.toLowerCase() === req.skillName.toLowerCase())).slice(0, 4).map((req, i) => (
              <Link key={i} to="/roadmap" className="flex items-center gap-5 p-5 rounded-3xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:shadow-lg transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-inner">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-main)] truncate transition-colors">{req.skillName}</p>
                  <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 transition-colors">+12 Mastery Points</p>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/interview" className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-[var(--text-main)]">Interview Chamber</p>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">AI voice drill</p>
            </div>
          </div>
        </Link>
        <Link to="/jobs" className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-[var(--text-main)]">Opportunity Hub</p>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">{user.currentSkills.length} skills matched</p>
            </div>
          </div>
        </Link>
        <Link to="/roadmap" className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Star size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-[var(--text-main)]">Career Roadmap</p>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">45-day plan</p>
            </div>
          </div>
        </Link>
      </div>

      {/* GitHub Portfolio & Resume Generator */}
      <div className="bg-[#0f172a]/40 border border-indigo-500/20 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Github size={120} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Github size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Project Catalyst</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Generate Resume & Portfolio from GitHub Links</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <input
              type="text"
              placeholder="Paste GitHub Repository URLs (comma separated)..."
              className="flex-1 bg-black/20 border border-[var(--border-color)] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-6 py-4 rounded-2xl text-sm font-medium text-[var(--text-main)] placeholder-slate-500 outline-none transition-all"
              value={githubLinks}
              onChange={e => setGithubLinks(e.target.value)}
            />
            <button
              onClick={handleGenerateAssets}
              disabled={!githubLinks.trim() || isGeneratingAssets}
              className="px-8 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {isGeneratingAssets ? <><Loader2 size={16} className="animate-spin" /> Analyzing</> : <><Sparkles size={16} /> Generate Assets</>}
            </button>
          </div>

          {generatedAssets && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--border-color)] animate-in slide-in-from-bottom-4">
              <div className="bg-white/5 border border-[var(--border-color)] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <FileText size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Resume Snippet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={exportResumeToPDF} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/40 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <Download size={14} /> Export PDF
                    </button>
                    <button onClick={() => copyToClipboard(generatedAssets.resumeSnippet, 'resume')} className="text-slate-400 hover:text-white transition-colors">
                      {copiedResume ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-slate-300 font-medium leading-relaxed font-sans">
                  {generatedAssets.resumeSnippet}
                </pre>
              </div>

              <div className="bg-white/5 border border-[var(--border-color)] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <LayoutTemplate size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Portfolio Snippet</span>
                  </div>
                  <button onClick={() => copyToClipboard(generatedAssets.portfolioSnippet, 'portfolio')} className="text-slate-400 hover:text-white transition-colors">
                    {copiedPortfolio ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-slate-300 font-medium leading-relaxed font-sans">
                  {generatedAssets.portfolioSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
