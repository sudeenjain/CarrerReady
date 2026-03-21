import React from 'react';
import { UserProfile } from '../types';
import { ReadinessScoreGauge } from '../components/ReadinessScoreGauge';
import SkillRadarChart from '../components/SkillRadarChart';
import { calculateReadinessScore } from '../utils/scoreCalculator';
import { JOB_ROLES } from '../constants';
import { Zap, ChevronRight, Github, Flame, Sparkles, Star, TrendingUp, BrainCircuit, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC<{ 
  user: UserProfile, 
  onOpenUpload: () => void,
  onOpenGitHub: () => void 
}> = ({ user, onOpenUpload, onOpenGitHub }) => {
  const role = JOB_ROLES.find(r => r.title === user.targetRole) || JOB_ROLES[0];
  
  const totalRoadmapTasks = 45 * 4;
  const roadmapCompletions = (user.completedResources || []).filter(k => 
    k.match(/^day-\d+-(learn|practice|build|review)$/)
  ).length;

  const breakdown = calculateReadinessScore(
    user.currentSkills, 
    role.requirements, 
    roadmapCompletions,
    totalRoadmapTasks
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-up duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mastery Overview */}
        <div className="lg:col-span-2 bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 shadow-2xl relative overflow-hidden group interactive-card">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
            <Sparkles size={180} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="w-56 h-56 shrink-0 relative">
              <ReadinessScoreGauge score={breakdown.total} />
            </div>
            
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 border border-green-500/30">
                  Neural Scan Synchronized
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Architect Progress, {user.name.split(' ')[0]}</h3>
                <p className="text-slate-300 text-lg font-medium leading-relaxed">
                  Your <span className="text-white">Mastery Score</span> is strictly cumulative. You have unlocked <span className="text-indigo-400 font-bold">{breakdown.total}%</span> of the {user.targetRole} ecosystem.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-default">
                  <Flame size={14} />
                  <span>{user.streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span>Level {Math.floor(breakdown.total/10)} Seeker</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global XP Stats */}
        <div className="bg-[#020617] rounded-[32px] p-8 text-white shadow-2xl border border-white/10 relative overflow-hidden group interactive-card">
          <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
             <Zap size={100} />
          </div>
          <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-400 mb-6">Total Achievement XP</h4>
          <div className="flex items-end gap-3">
             <span className="text-6xl font-black text-white">{breakdown.total * 12}</span>
             <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Points</span>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Industry Ready Velocity</p>
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp size={12} />
              <span className="text-[10px] font-black">Accelerated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Coverage Visualization */}
        <div className="lg:col-span-2 bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl interactive-card">
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Skill Coverage</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Expertise vs. Industry Benchmark</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase">You</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase">Target</span>
              </div>
            </div>
          </div>
          <SkillRadarChart user={user} />
          <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
            <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              This visualization maps your current proficiency levels against the standard requirements for a <span className="text-white font-bold">{user.targetRole}</span>. Focus on expanding the indigo area to match the benchmark.
            </p>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <button 
            onClick={onOpenGitHub}
            className="bg-[#0f172a]/40 backdrop-blur-md rounded-[32px] p-6 border border-white/10 hover:border-indigo-500/50 transition-all group text-left w-full interactive-card"
          >
            <h4 className="font-black text-white text-[10px] uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
              <Github size={14} className="group-hover:rotate-12 transition-transform" /> Evidence Pulse
            </h4>
            <div className="space-y-2">
               <p className="text-xs font-bold text-white">GitHub AI Verification</p>
               <p className="text-[10px] text-slate-400 font-medium">Deep-scan repositories to verify technical expertise signals.</p>
               <div className="flex items-center gap-1.5 pt-2 text-indigo-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Sync Evidence</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </button>

          <Link to="/intelligence" className="bg-[#0f172a]/40 backdrop-blur-md rounded-[32px] p-6 border border-white/10 hover:border-indigo-500/50 transition-all group block interactive-card">
            <h4 className="font-black text-indigo-400 text-[10px] uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
              <BrainCircuit size={14} /> Strategic Intelligence
            </h4>
            <div className="space-y-2">
               <p className="text-xs font-bold text-white">AI Ensemble Ready</p>
               <p className="text-[10px] text-slate-400 font-medium">Explore the Multi-Model Roadmap and Skill Decay predictions.</p>
               <div className="flex items-center gap-1.5 pt-2 text-indigo-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">View Blueprint</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </Link>

          <div className="bg-indigo-600 rounded-[32px] p-6 shadow-xl shadow-indigo-600/20 relative overflow-hidden group interactive-card">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
               <Sparkles size={60} />
            </div>
            <h4 className="font-black text-indigo-100 text-[10px] uppercase tracking-widest mb-2">Next Milestone</h4>
            <p className="text-white font-black text-sm">Complete Day 7 Project</p>
            <p className="text-[10px] text-indigo-200 font-medium mt-1">Unlocks +15 Mastery Points</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Achievements List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-2xl font-black text-white tracking-tighter">Verified Masteries</h4>
            <Link to="/analysis" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Audit All Skills</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.currentSkills.slice(0, 6).map((skill, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all interactive-card">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <div>
                    <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{skill.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Verified via {skill.source}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-white/10">
                  {skill.level}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Unlocks */}
        <div className="space-y-8">
          <h4 className="text-2xl font-black text-white tracking-tighter px-2">Next Unlocks</h4>
          <div className="space-y-4">
            {role.requirements.filter(req => !user.currentSkills.some(s => s.name.toLowerCase() === req.skillName.toLowerCase())).slice(0, 4).map((req, i) => (
              <Link key={i} to="/roadmap" className="flex items-center gap-5 p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all group interactive-card">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{req.skillName}</p>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">+12 Mastery Points</p>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;