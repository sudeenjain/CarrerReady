import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, RoadmapStep } from '../types';
import { analysisService } from '../analysisService';
import { roadmapApi } from '../src/api/roadmap';
import {
  Play, FileText, Code, CheckCircle2, ChevronDown, WifiOff, Sparkles, CheckCircle,
  Circle, Zap, TrendingUp, Award, ExternalLink, Youtube, RefreshCw, ChevronRight,
  Loader2, Clock, Target, Brain, ListTodo, Hammer, Eye, BarChart3, Github,
  HelpCircle, Send, MessageSquare, X, Flame, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ReactFlow, Controls, Background, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { div } from 'framer-motion/client';

const CustomNode = ({ data }: any) => {
  return (
    <div className={`p-4 rounded-[24px] border transition-all hover:scale-105 cursor-pointer min-w-[220px] ${data.isDone ? 'bg-green-500/10 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-[#0f172a] border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]'}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Day {data.day}</span>
        {data.isDone && <CheckCircle2 size={12} className="text-green-400" />}
      </div>
      <h3 className="text-xs font-bold text-[var(--text-main)] dark:text-white leading-tight">{data.label}</h3>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </div>
  );
};
const nodeTypes = { custom: CustomNode };

// Floating Mentor Chat Component
const MentorChat = ({ topic }: { topic: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await roadmapApi.chatWithMentor(topic, input, messages);
      setMessages(prev => [...prev, { role: 'model', text: res.response }]);
    } catch (e) {
      toast.error('Mentor is offline');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-600/50 hover:scale-110 transition-transform z-50 animate-bounce"
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 max-h-[600px] bg-[var(--bg-card)]/90 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl rounded-[32px] flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10">
      <div className="p-5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"><Brain size={20} className="text-[var(--text-main)] dark:text-white" /></div>
          <div>
            <h4 className="text-sm font-black text-[var(--text-main)] dark:text-white">AI Mentor</h4>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{topic.slice(0, 20)}...</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-[var(--text-main)] dark:text-white transition-colors"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[400px] custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-xs text-slate-400 font-medium">Ask me to explain concepts, generate notes, or provide interview questions about {topic}!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-slate-200 rounded-bl-sm border border-white/5'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-white/10 rounded-2xl rounded-bl-sm border border-white/5 flex gap-1">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-4 border-t border-[var(--border-color)] bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask mentor..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-[var(--text-main)] dark:text-white focus:outline-none focus:border-indigo-500 pr-12 transition-colors"
          />
          <button onClick={handleSend} className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Roadmap: React.FC<{ user: UserProfile, onUpdateUser: (u: UserProfile) => void }> = ({ user, onUpdateUser }) => {
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState('Initializing Roadmap Ecosystem...');
  const [activePhase, setActivePhase] = useState<string>('Foundation');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Progress tracking state
  const [streak, setStreak] = useState(user.streak || 0);
  const [totalHours, setTotalHours] = useState(0);

  const [projectUrls, setProjectUrls] = useState<Record<number, string>>({});
  const [isSyncingProject, setIsSyncingProject] = useState<number | null>(null);

  const [dynamicVideos, setDynamicVideos] = useState<Record<number, { id: string, title: string, thumbnail: string }>>({});

  useEffect(() => {
    const unsubscribe = analysisService.subscribeStatus(setSystemStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        const dbRoadmap = await roadmapApi.getRoadmap();
        setSteps(dbRoadmap.days);
        setStreak(dbRoadmap.streak);
        setTotalHours(dbRoadmap.totalLearningHours);
      } catch (err) {
        // If no roadmap exists, we must generate one
        generateAndSaveRoadmap();
      } finally {
        setLoading(false);
      }
    };

    if (navigator.onLine) {
      loadRoadmap();
    } else {
      const saved = localStorage.getItem(`roadmap_daily_${user.targetRole}`);
      if (saved) setSteps(JSON.parse(saved));
      setLoading(false);
    }
  }, [user.targetRole]);

  const generateAndSaveRoadmap = async () => {
    setLoading(true);
    setSystemStatus('Generating Elite Roadmap...');
    try {
      const data = await analysisService.generateRoadmap(user.currentSkills, user.targetRole);
      // Map it to backend schema structure
      const formattedDays = data.map((d: any) => ({
        ...d,
        completionStatus: { learn: false, practice: false, build: false, review: false },
        watchedVideos: [],
        notes: '',
        weakTopics: []
      }));
      setSteps(formattedDays);

      const payload = {
        targetRole: user.targetRole,
        streak: user.streak || 0,
        totalLearningHours: 0,
        days: formattedDays
      };

      try {
        await roadmapApi.saveRoadmap(payload as any);
      } catch (backendErr) {
        console.warn("Backend sync failed. Saving locally.", backendErr);
        toast.error("Offline mode: Roadmap saved locally.");
      }

      localStorage.setItem(`roadmap_daily_${user.targetRole}`, JSON.stringify(formattedDays));
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDynamicVideo = async (day: number, topic: string) => {
    if (dynamicVideos[day]) return; // already loaded
    try {
      const res = await roadmapApi.getYouTubeRecommendation(topic);
      setDynamicVideos(prev => ({ ...prev, [day]: { id: res.video_id, title: res.title, thumbnail: res.thumbnail } }));
    } catch (e) {
      console.warn("Could not load dynamic video", e);
    }
  };

  const handleSyncProjectLink = async (day: number, url: string) => {
    if (!url) return;
    setIsSyncingProject(day);
    
    const step = steps.find(s => s.day === day);
    const goal = step ? step.primaryGoal : `Day ${day} Project`;

    try {
      // Send submission details to Formspree endpoint (mykvwrkl)
      const res = await fetch('https://formspree.io/f/mykvwrkl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: user.name || 'Student',
          email: user.email || 'student@careerready.ai',
          targetRole: user.targetRole,
          day: day,
          projectGoal: goal,
          repositoryUrl: url,
          _subject: `New CareerReadyAI Project Submission (Day ${day}) from ${user.name || 'Student'}`
        })
      });

      if (!res.ok) {
        throw new Error('Formspree transmission failed');
      }

      // Persist the submitted URL locally
      const updatedSteps = [...steps];
      const stepIdx = updatedSteps.findIndex(s => s.day === day);
      if (stepIdx !== -1) {
        updatedSteps[stepIdx].projectSubmissionUrl = url;
        setSteps(updatedSteps);
        localStorage.setItem(`roadmap_daily_${user.targetRole}`, JSON.stringify(updatedSteps));
      }

      toast.success("GitHub Project Submitted & Synced Successfully! 🔥");
    } catch (err) {
      console.error("Project submission failed:", err);
      toast.error("Submission failed. Check your network.");
    } finally {
      setIsSyncingProject(null);
    }
  };

  const taskKeys = ['learn', 'practice', 'build', 'review'] as const;
  type TaskKey = typeof taskKeys[number];

  const toggleTask = async (day: number, taskKey: TaskKey) => {
    const updatedSteps = [...steps];
    const stepIdx = updatedSteps.findIndex(s => s.day === day);
    if (stepIdx === -1) return;

    const step = updatedSteps[stepIdx];
    const currentStatus = step.completionStatus || { learn: false, practice: false, build: false, review: false };
    const newStatus = { ...currentStatus, [taskKey]: !currentStatus[taskKey] };

    step.completionStatus = newStatus;
    setSteps(updatedSteps);

    // Update backend asynchronously
    try {
      await roadmapApi.updateProgress(day, { completionStatus: newStatus });
    } catch (e) {
      console.warn("Backend progress sync failed, working offline.");
    }
  };

  const toggleFullDay = async (day: number) => {
    const updatedSteps = [...steps];
    const stepIdx = updatedSteps.findIndex(s => s.day === day);
    if (stepIdx === -1) return;

    const step = updatedSteps[stepIdx];
    const newStatus = { learn: true, practice: true, build: true, review: true };
    step.completionStatus = newStatus;
    setSteps(updatedSteps);

    try {
      await roadmapApi.updateProgress(day, { completionStatus: newStatus });
      setStreak(s => s + 1);
      toast.success(`Day ${day} fully mastered! Streak +1 🔥`);
    } catch (e) {
      setStreak(s => s + 1); // Optimistic update
      toast.success(`Offline: Day ${day} fully mastered! Streak +1 🔥`);
    }
  };

  const isTaskComplete = (day: number, taskKey: TaskKey) => {
    const step = steps.find(s => s.day === day);
    return step?.completionStatus?.[taskKey] || false;
  };

  const isDayFullyComplete = (day: number) => {
    return taskKeys.every(key => isTaskComplete(day, key));
  };

  const getDayProgress = (day: number) => {
    const completedCount = taskKeys.filter(key => isTaskComplete(day, key)).length;
    return (completedCount / 4) * 100;
  };

  const totalProgress = useMemo(() => {
    if (steps.length === 0) return 0;
    const completedTasks = steps.reduce((acc, step) => {
      const c = step.completionStatus || {};
      return acc + (c.learn ? 1 : 0) + (c.practice ? 1 : 0) + (c.build ? 1 : 0) + (c.review ? 1 : 0);
    }, 0);
    return Math.round((completedTasks / (steps.length * 4)) * 100);
  }, [steps]);

  const filteredSteps = useMemo(() => {
    return steps.filter(s => {
      if (!s.phase) return false;
      return s.phase.toLowerCase().includes(activePhase.toLowerCase()) ||
        activePhase.toLowerCase().includes(s.phase.toLowerCase());
    });
  }, [steps, activePhase]);

  const phases = ['Foundation', 'Skill Building', 'Projects', 'Interview Readiness'];

  const nodes = useMemo(() => {
    return filteredSteps.map((step, idx) => ({
      id: `node-${step.day}`,
      type: 'custom',
      position: { x: (idx % 4) * 260, y: Math.floor(idx / 4) * 160 },
      data: {
        label: step.primaryGoal,
        day: step.day,
        isDone: isDayFullyComplete(step.day),
        step: step
      }
    }));
  }, [filteredSteps, steps]);

  const edges = useMemo(() => {
    const edgeList = [];
    for (let i = 0; i < filteredSteps.length - 1; i++) {
      edgeList.push({
        id: `e-${filteredSteps[i].day}-${filteredSteps[i + 1].day}`,
        source: `node-${filteredSteps[i].day}`,
        target: `node-${filteredSteps[i + 1].day}`,
        animated: true,
        style: { stroke: '#4f46e5', strokeWidth: 2 }
      });
    }
    return edgeList;
  }, [filteredSteps]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={40} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-[var(--text-main)] dark:text-white tracking-tighter uppercase">{systemStatus}</h3>
          <p className="text-slate-500 text-sm font-medium">Assembling an AI-driven learning ecosystem tailored for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      {/* Dynamic Floating Mentor Chat */}
      <MentorChat topic={filteredSteps.find(s => s.day === expandedDay)?.primaryGoal || activePhase} />

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[var(--bg-card)]/60 backdrop-blur-xl rounded-[40px] p-10 border border-[var(--border-color)] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform pointer-events-none">
            <Target size={240} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
              <Sparkles size={14} /> AI Ecosystem Enabled
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-[var(--text-main)] dark:text-white tracking-tighter leading-[0.9]">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Tactical</span><br />Roadmap
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Your personalized path to mastery in <span className="text-indigo-400 font-bold">{user.targetRole}</span>. Adaptive. Intensive. Driven by real-world signals.
            </p>
            <button
              onClick={generateAndSaveRoadmap}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 w-fit"
            >
              <RefreshCw size={16} /> Re-Calculate Path
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--bg-card)] to-indigo-900/10 backdrop-blur-xl rounded-[40px] p-8 border border-[var(--border-color)] shadow-2xl flex flex-col justify-center gap-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mission Progress</p>
              <span className="text-2xl font-black text-[var(--text-main)] dark:text-white">{totalProgress}%</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out" style={{ width: `${totalProgress}%` }}></div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-2">
              <Flame size={24} className="text-orange-500" />
              <span className="text-2xl font-black text-[var(--text-main)] dark:text-white">{streak}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Day Streak</span>
            </div>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-2">
              <Clock size={24} className="text-indigo-400" />
              <span className="text-2xl font-black text-[var(--text-main)] dark:text-white">{totalHours}h</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Learning Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-[32px] space-y-2">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2"><Target size={14} /> Next Critical Target</h5>
          <p className="text-sm font-bold text-[var(--text-main)] dark:text-white leading-relaxed">Advanced React Patterns & Custom Hooks Implementation</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[32px] space-y-2">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-2"><Brain size={14} /> Detected Weakness</h5>
          <p className="text-sm font-bold text-[var(--text-main)] dark:text-white leading-relaxed">State Management with Redux Toolkit</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-[32px] space-y-2">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2"><Hammer size={14} /> Suggested Project</h5>
          <p className="text-sm font-bold text-[var(--text-main)] dark:text-white leading-relaxed">Build a full-stack Kanban board with drag-and-drop</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-[32px] space-y-2">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2"><HelpCircle size={14} /> Interview Prep</h5>
          <p className="text-sm font-bold text-[var(--text-main)] dark:text-white leading-relaxed">Explain Event Loop & Promise Microtasks</p>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.map((phase, idx) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`p-6 rounded-[32px] border transition-all relative overflow-hidden group ${activePhase === phase
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 scale-105'
              : 'bg-white/5 border-[var(--border-color)] text-slate-500 hover:bg-white/10 hover:border-white/20'
              }`}
          >
            <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform ${activePhase === phase ? 'text-[var(--text-main)] dark:text-white' : 'text-slate-400'}`}>
              {idx === 0 && <Brain size={80} />}
              {idx === 1 && <Zap size={80} />}
              {idx === 2 && <Code size={80} />}
              {idx === 3 && <TrendingUp size={80} />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Phase {idx + 1}</p>
            <h3 className="text-xl font-black tracking-tighter relative z-10">{phase}</h3>
          </button>
        ))}
      </div>

      {/* Interactive Skill Tree */}
      <div className="h-[700px] w-full rounded-[40px] overflow-hidden border border-[var(--border-color)] bg-[#0f172a]/60 backdrop-blur-xl relative shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => {
            setExpandedDay(node.data.day);
            if (!node.data.step.youtubeVideoId) loadDynamicVideo(node.data.day, node.data.step.primaryGoal);
          }}
          fitView
          className="react-flow-dark"
        >
          <Background color="#1e1e2f" gap={20} />
          <Controls className="!bg-black/50 !border-white/10 !fill-white" />
        </ReactFlow>
        <div className="absolute top-4 left-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-400">
          Interactive Node Graph
        </div>
      </div>

      {/* Detail Modal */}
      {expandedDay && (() => {
        const step = steps.find(s => s.day === expandedDay);
        if (!step) return null;
        const isDone = isDayFullyComplete(step.day);
        const dayProg = getDayProgress(step.day);

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0f172a] w-full max-w-3xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-y-auto custom-scrollbar border border-[var(--border-color)] relative">
              <div className="p-8 space-y-8">
                <button onClick={() => setExpandedDay(null)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-[var(--text-main)] dark:text-white"><X size={20} /></button>
                <div className="flex items-center gap-4 pr-12">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 shrink-0 shadow-xl ${isDone ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>
                    {isDone ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{step.day}</span>}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[var(--text-main)] dark:text-white">{step.primaryGoal}</h3>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black mt-1">Phase: {step.phase}</p>
                  </div>
                </div>

                {/* Video / Content */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <Youtube size={16} /> Core Masterclass
                  </div>
                  {step.youtubeVideoId || dynamicVideos[step.day] ? (
                    <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-black/40 border border-white/5 shadow-2xl relative group">
                      {step.youtubeVideoId ? (
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${step.youtubeVideoId}`} title="YouTube player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      ) : (
                        <div className="relative w-full h-full">
                          <img src={dynamicVideos[step.day].thumbnail} alt="thumbnail" className="w-full h-full object-cover opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                            <a href={`https://youtube.com/watch?v=${dynamicVideos[step.day].id}`} target="_blank" rel="noreferrer" className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                              <Play fill="currentColor" size={24} />
                            </a>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent">
                            <p className="font-bold text-[var(--text-main)] dark:text-white text-sm truncate">{dynamicVideos[step.day].title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-[24px] flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/10 text-slate-500">
                      <Search size={32} className="opacity-20 animate-pulse" />
                      <p className="text-xs font-bold mt-2">Discovering Optimal Resource...</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-[24px] flex items-center gap-3">
                    <Clock size={20} className="text-indigo-400" />
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Time Budget</p>
                      <p className="text-sm font-black text-[var(--text-main)] dark:text-white">{step.timeEstimate}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-[24px] flex items-center gap-3">
                    <Award size={20} className="text-purple-400" />
                    <div>
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">XP Reward</p>
                      <p className="text-sm font-black text-[var(--text-main)] dark:text-white">+{step.points} XP</p>
                    </div>
                  </div>
                </div>

                {/* Daily Mini Tasks */}
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mini Task Protocol</div>
                  <div className="grid grid-cols-1 gap-3">
                    {taskKeys.map((k) => (
                      <div
                        key={k}
                        onClick={() => toggleTask(step.day, k)}
                        className={`flex items-start gap-4 p-4 rounded-[20px] border cursor-pointer transition-all hover:scale-[1.01] ${isTaskComplete(step.day, k) ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                      >
                        <div className={`mt-0.5 shrink-0 ${isTaskComplete(step.day, k) ? 'text-green-400' : 'text-slate-600'}`}>
                          {isTaskComplete(step.day, k) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </div>
                        <div>
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{k}</h5>
                          <p className={`text-xs font-bold leading-relaxed ${isTaskComplete(step.day, k) ? 'text-green-100' : 'text-slate-300'}`}>
                            {k === 'learn' && step.learningTask}
                            {k === 'practice' && step.practiceTask}
                            {k === 'build' && step.buildingTask}
                            {k === 'review' && step.reviewTask}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GitHub Analysis Block (Phase 3 mostly) */}
                {step.phase === 'Projects' && (
                  <div className="p-5 rounded-[24px] bg-indigo-900/20 border border-indigo-500/30 flex flex-col gap-3 group">
                    <div className="flex items-center gap-3 text-indigo-400">
                      <Github size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Live Code Synchronization</span>
                    </div>
                    <p className="text-xs font-medium text-slate-300">Expected: {step.expectedOutput}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="text"
                        placeholder="Repository URL (e.g., github.com/user/repo)"
                        value={projectUrls[step.day] !== undefined ? projectUrls[step.day] : (step.projectSubmissionUrl || '')}
                        onChange={(e) => setProjectUrls({ ...projectUrls, [step.day]: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-xs text-[var(--text-main)] dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleSyncProjectLink(step.day, projectUrls[step.day] !== undefined ? projectUrls[step.day] : (step.projectSubmissionUrl || ''))}
                        disabled={!(projectUrls[step.day] !== undefined ? projectUrls[step.day] : (step.projectSubmissionUrl || '')) || isSyncingProject === step.day}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSyncingProject === step.day ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Analyze
                      </button>
                    </div>
                  </div>
                )}

                {/* Final Confirm */}
                <button
                  onClick={() => toggleFullDay(step.day)}
                  disabled={isDone}
                  className={`w-full py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isDone
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20'
                    }`}
                >
                  {isDone ? <CheckCircle2 size={18} /> : <TrendingUp size={18} />}
                  {isDone ? 'Day Operational Status: Mastered' : 'Confirm Day Completion'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Roadmap;
