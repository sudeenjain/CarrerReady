
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, RoadmapStep } from '../types';
import { analysisService } from '../analysisService';
import { 
  Play, 
  FileText, 
  Code, 
  CheckCircle2, 
  ChevronDown, 
  WifiOff, 
  Sparkles, 
  CheckCircle,
  Circle,
  Zap,
  TrendingUp,
  Award,
  ExternalLink,
  ChevronRight,
  Loader2,
  Clock,
  Target,
  Brain,
  ListTodo,
  Hammer,
  Eye
} from 'lucide-react';

const Roadmap: React.FC<{ user: UserProfile, onUpdateUser: (u: UserProfile) => void }> = ({ user, onUpdateUser }) => {
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePhase, setActivePhase] = useState<string>('Foundation');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const taskKeys = ['learn', 'practice', 'build', 'review'] as const;
  type TaskKey = typeof taskKeys[number];

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    const savedRoadmap = localStorage.getItem(`roadmap_daily_${user.targetRole}`);
    if (savedRoadmap) {
      setSteps(JSON.parse(savedRoadmap));
    } else if (navigator.onLine) {
      fetchRoadmap();
    }

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [user.targetRole]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const data = await analysisService.generateRoadmap(user.currentSkills, user.targetRole);
      setSteps(data);
      localStorage.setItem(`roadmap_daily_${user.targetRole}`, JSON.stringify(data));
    } catch (err) {
      console.error("Roadmap generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const isTaskComplete = (day: number, taskKey: TaskKey) => {
    return (user.completedResources || []).includes(`day-${day}-${taskKey}`);
  };

  const isDayFullyComplete = (day: number) => {
    return taskKeys.every(key => isTaskComplete(day, key));
  };

  const getDayProgress = (day: number) => {
    const completed = taskKeys.filter(key => isTaskComplete(day, key)).length;
    return (completed / taskKeys.length) * 100;
  };

  const toggleTask = (day: number, taskKey: TaskKey) => {
    const key = `day-${day}-${taskKey}`;
    const current = user.completedResources || [];
    const updated = current.includes(key)
      ? current.filter(k => k !== key)
      : [...current, key];
    
    onUpdateUser({ ...user, completedResources: updated });
  };

  const toggleFullDay = (day: number) => {
    const current = user.completedResources || [];
    const dayTasks = taskKeys.map(key => `day-${day}-${key}`);
    const isFull = dayTasks.every(k => current.includes(k));
    
    let updated;
    if (isFull) {
      // Unmark all for this day
      updated = current.filter(k => !dayTasks.includes(k));
    } else {
      // Mark all for this day
      const otherTasks = current.filter(k => !dayTasks.includes(k));
      updated = [...otherTasks, ...dayTasks];
    }
    
    onUpdateUser({ ...user, completedResources: updated });
  };

  const phases = ['Foundation', 'Skill Building', 'Projects', 'Interview Readiness'];

  const filteredSteps = useMemo(() => {
    return steps.filter(s => s.phase === activePhase);
  }, [steps, activePhase]);

  const globalProgress = useMemo(() => {
    if (steps.length === 0) return 0;
    const taskCompletionCount = (user.completedResources || []).filter(k => k.match(/^day-\d+-(learn|practice|build|review)$/)).length;
    const totalTasks = steps.length * 4;
    return Math.round((taskCompletionCount / totalTasks) * 100);
  }, [steps, user.completedResources]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={32} />
        </div>
        <div className="text-center">
          <p className="text-white font-black text-2xl tracking-tighter uppercase">Assembling Action Plan</p>
          <p className="text-slate-500 text-sm font-bold mt-2">Personalizing daily tasks for your {user.targetRole} journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
      {isOffline && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-400 text-xs font-bold">
          <WifiOff size={16} />
          <span>Local Signal: Using cached roadmap data.</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform pointer-events-none">
           <Target size={280} />
        </div>
        
        <div className="relative z-10 space-y-6 text-center lg:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
            <Award size={14} className="animate-pulse" /> Career Action Protocol
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Your Daily <br/><span className="gradient-text">Mastery System.</span></h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
            A precise 45-day system divided into core phases. Mark individual tasks to track your granular growth toward {user.targetRole} mastery.
          </p>
        </div>

        <div className="relative w-48 h-48 shrink-0">
           <svg className="w-full h-full transform -rotate-90">
             <circle cx="50%" cy="50%" r="80" className="stroke-white/5" strokeWidth="14" fill="transparent" />
             <circle 
                cx="50%" 
                cy="50%" 
                r="80" 
                className="stroke-indigo-500 transition-all duration-1000 ease-out" 
                strokeWidth="14" 
                fill="transparent" 
                strokeDasharray={502} 
                strokeDashoffset={502 - (globalProgress / 100) * 502} 
                strokeLinecap="round" 
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-5xl font-black text-white">{globalProgress}%</span>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Global Mastery</span>
           </div>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.map((p, i) => (
          <button 
            key={p}
            onClick={() => setActivePhase(p)}
            className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 relative ${
              activePhase === p 
                ? 'bg-indigo-600 text-white border-transparent shadow-xl shadow-indigo-500/20 scale-105 z-10' 
                : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
            }`}
          >
            <span className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em]">Phase 0{i+1}</span>
            <span className="text-xs font-black uppercase tracking-tight text-center leading-tight">{p}</span>
          </button>
        ))}
      </div>

      {/* Daily Timeline */}
      <div className="space-y-6">
        {filteredSteps.length === 0 && (
           <div className="py-20 text-center bg-white/5 rounded-[40px] border border-white/5">
              <Loader2 className="animate-spin mx-auto text-slate-600 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Generating Actionable Signal...</p>
           </div>
        )}
        
        {filteredSteps.map((step) => {
          const isDone = isDayFullyComplete(step.day);
          const isExpanded = expandedDay === step.day;
          const dayProg = getDayProgress(step.day);

          return (
            <div key={step.day} className={`group/day transition-all duration-500`}>
              <div className={`rounded-[36px] border transition-all duration-500 overflow-hidden ${
                isExpanded ? 'bg-[#0f172a]/80 border-indigo-500/30 shadow-2xl' : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}>
                {/* Day Header */}
                <div 
                  className="p-8 cursor-pointer flex items-center justify-between gap-6"
                  onClick={() => setExpandedDay(isExpanded ? null : step.day)}
                >
                  <div className="flex items-center gap-8 flex-1 min-w-0">
                    <div className={`w-16 h-16 rounded-[24px] flex flex-col items-center justify-center shrink-0 transition-all duration-500 relative ${
                      isDone ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-500 border border-white/5'
                    }`}>
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Day</span>
                      <span className="text-2xl font-black">{step.day}</span>
                      {dayProg > 0 && dayProg < 100 && (
                        <div className="absolute -bottom-2 w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${dayProg}%` }}></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Mission: {step.primaryGoal}</p>
                       <h4 className={`text-2xl font-black tracking-tighter truncate ${isDone ? 'text-green-400' : 'text-white'}`}>
                         {isDone ? 'Day Objective Accomplished' : 'Awaiting Operational Sync'}
                       </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isDone ? (
                       <div className="px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20">All Tasks Confirmed</div>
                    ) : (
                       <div className="px-4 py-2 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2">
                         <ListTodo size={12} /> {taskKeys.filter(k => isTaskComplete(step.day, k)).length}/4 Tasks
                       </div>
                    )}
                    <ChevronDown className={`transition-transform duration-500 text-slate-600 ${isExpanded ? 'rotate-180' : ''}`} size={24} />
                  </div>
                </div>

                {/* Day Content */}
                {isExpanded && (
                  <div className="px-8 pb-10 pt-2 animate-in slide-in-from-top-4 duration-500 space-y-8">
                    {/* Actionable Tasks Grid - 4 Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Learn */}
                      <div 
                        onClick={() => toggleTask(step.day, 'learn')}
                        className={`p-6 rounded-[32px] border space-y-4 group/card cursor-pointer transition-all ${
                          isTaskComplete(step.day, 'learn') 
                            ? 'bg-blue-500/10 border-blue-500/30' 
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                           isTaskComplete(step.day, 'learn') ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-400'
                         }`}>
                            {isTaskComplete(step.day, 'learn') ? <CheckCircle size={20} /> : <Brain size={20} />}
                         </div>
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">01. Learn</h5>
                         <p className={`text-xs font-bold leading-relaxed transition-colors ${isTaskComplete(step.day, 'learn') ? 'text-blue-200' : 'text-slate-300'}`}>
                           {step.learningTask}
                         </p>
                      </div>
                      
                      {/* Practice */}
                      <div 
                        onClick={() => toggleTask(step.day, 'practice')}
                        className={`p-6 rounded-[32px] border space-y-4 group/card cursor-pointer transition-all ${
                          isTaskComplete(step.day, 'practice') 
                            ? 'bg-indigo-500/10 border-indigo-500/30' 
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                           isTaskComplete(step.day, 'practice') ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-400'
                         }`}>
                            {isTaskComplete(step.day, 'practice') ? <CheckCircle size={20} /> : <Zap size={20} />}
                         </div>
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">02. Practice</h5>
                         <p className={`text-xs font-bold leading-relaxed transition-colors ${isTaskComplete(step.day, 'practice') ? 'text-indigo-200' : 'text-slate-300'}`}>
                           {step.practiceTask}
                         </p>
                      </div>

                      {/* Build */}
                      <div 
                        onClick={() => toggleTask(step.day, 'build')}
                        className={`p-6 rounded-[32px] border space-y-4 group/card cursor-pointer transition-all ${
                          isTaskComplete(step.day, 'build') 
                            ? 'bg-purple-500/10 border-purple-500/30' 
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                           isTaskComplete(step.day, 'build') ? 'bg-purple-500 text-white' : 'bg-purple-500/10 text-purple-400'
                         }`}>
                            {isTaskComplete(step.day, 'build') ? <CheckCircle size={20} /> : <Hammer size={20} />}
                         </div>
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">03. Build</h5>
                         <p className={`text-xs font-bold leading-relaxed transition-colors ${isTaskComplete(step.day, 'build') ? 'text-purple-200' : 'text-slate-300'}`}>
                           {step.buildingTask}
                         </p>
                      </div>

                      {/* Review */}
                      <div 
                        onClick={() => toggleTask(step.day, 'review')}
                        className={`p-6 rounded-[32px] border space-y-4 group/card cursor-pointer transition-all ${
                          isTaskComplete(step.day, 'review') 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                           isTaskComplete(step.day, 'review') ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-400'
                         }`}>
                            {isTaskComplete(step.day, 'review') ? <CheckCircle size={20} /> : <Eye size={20} />}
                         </div>
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">04. Review</h5>
                         <p className={`text-xs font-bold leading-relaxed transition-colors ${isTaskComplete(step.day, 'review') ? 'text-green-200' : 'text-slate-300'}`}>
                           {step.reviewTask}
                         </p>
                      </div>
                    </div>

                    {/* Verifiable Output Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isDone ? 'bg-green-500/10 text-green-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                             {isDone ? <CheckCircle2 size={28} /> : <CheckCircle size={28} />}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tangible Output</p>
                             <p className="text-base font-black text-white">{step.expectedOutput}</p>
                          </div>
                       </div>
                       
                       <button 
                        onClick={() => toggleFullDay(step.day)}
                        className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${
                          isDone 
                          ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' 
                          : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 active:scale-95'
                        }`}
                       >
                         {isDone ? <CheckCircle2 size={18}/> : <TrendingUp size={18} />}
                         {isDone ? 'Achievement Unlocked' : 'Authorize Day Completion'}
                       </button>
                    </div>

                    {/* Milestone Signal */}
                    {step.day % 7 === 0 && (
                      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-center gap-4">
                         <Sparkles className="text-amber-400" size={24} />
                         <div>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Checkpoint Intelligence</p>
                            <p className="text-sm font-black text-white">{step.milestone}</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Dynamic Mentor Context */}
      <div className="bg-slate-900 rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-10"><Sparkles size={120} /></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
               <Award size={40} className="text-white" />
            </div>
            <div className="space-y-3 text-center md:text-left">
               <h4 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Mentor Directive: Phase - {activePhase}</h4>
               <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
                 During the **{activePhase}** phase, your focus should be on {
                    activePhase === 'Foundation' ? 'building a rock-solid understanding of core architectural principles.' :
                    activePhase === 'Skill Building' ? 'drilling specific technical competencies until they become second nature.' :
                    activePhase === 'Projects' ? 'synthesizing your skills into unique, production-ready portfolio artifacts.' :
                    'stress-testing your knowledge against real-world interview signals.'
                 } Click each card above to confirm your task completion.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Roadmap;
