import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserProfile } from '../types';
import { 
  Mic, PhoneOff, Bot, Loader2, Play, ShieldAlert, Award, AudioLines as WaveIcon, 
  Clock, Zap, Activity, Video, VideoOff, History, BookOpen, User,
  CheckCircle2, AlertTriangle, TrendingUp, ChevronRight, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
type InterviewDifficulty = 'behavioral' | 'technical' | 'system-design';

interface Scorecard {
  communication: number;
  technicalDepth: number;
  confidence: number;
  structure: number;
  feedback: string;
}

interface InterviewSession {
  id: string;
  date: string;
  duration: number;
  difficulty: InterviewDifficulty;
  transcript: { role: 'user' | 'model'; text: string; timestamp: string }[];
  scorecard: Scorecard;
}

// AI Service Fallback
const fetchLLMFallback = async (prompt: string, keys: any, jsonMode = false, imageData?: string): Promise<string> => {
  if (keys.groq && !imageData) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.groq}` },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'system', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7,
          response_format: jsonMode ? { type: "json_object" } : undefined
        })
      });
      const data = await res.json();
      return data.choices[0].message.content;
    } catch (e) { console.warn('Groq failed', e); }
  }

  if (keys.gemini) {
    try {
      const parts: any[] = [{ text: prompt }];
      if (imageData) {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } });
      }
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { 
            maxOutputTokens: 1000, 
            temperature: 0.7,
            responseMimeType: jsonMode ? "application/json" : "text/plain"
          }
        })
      });
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) { console.warn('Gemini failed', e); }
  }

  if (keys.openai) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.openai}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ 
            role: 'user', 
            content: imageData ? [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageData } }
            ] : prompt 
          }],
          max_tokens: 1000,
          response_format: jsonMode ? { type: "json_object" } : undefined
        })
      });
      const data = await res.json();
      return data.choices[0].message.content;
    } catch (e) { console.error('OpenAI failed', e); }
  }

  // Final fallback: If vision models failed, strip the image and try Groq text-only
  if (imageData && keys.groq) {
    try {
      console.log('Vision models failed (likely rate limited). Falling back to text-only Groq.');
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.groq}` },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'system', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7,
          response_format: jsonMode ? { type: "json_object" } : undefined
        })
      });
      const data = await res.json();
      return data.choices[0].message.content;
    } catch (e) { console.warn('Final Groq fallback failed', e); }
  }

  return jsonMode ? "{}" : "I'm having trouble connecting.";
};

const Interview: React.FC<{ user: UserProfile }> = ({ user }) => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'setup' | 'history' | 'bank'>('setup');
  const [history, setHistory] = useState<InterviewSession[]>([]);

  // Interview State
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'listening' | 'thinking' | 'responding' | 'idle'>('idle');
  const statusRef = useRef(status);
  
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('technical');
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string, timestamp: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [typedOutput, setTypedOutput] = useState(''); // Typewriter effect
  
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [currentScorecard, setCurrentScorecard] = useState<Scorecard | null>(null);

  // Real-time Metrics
  const [fillerWords, setFillerWords] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(100);
  const [dynamicQBank, setDynamicQBank] = useState<Record<string, string[]> | null>(null);

  // Refs
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  const transcriptRef = useRef<{ role: 'user' | 'model', text: string, timestamp: string }[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechStartRef = useRef<number>(0);
  
  // Audio & Camera
  const audioContextRef = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Replay Session
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [feedbackTimestamps, setFeedbackTimestamps] = useState<{time: number, feedback: string}[]>([]);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem(`interview_history_${user.targetRole}`);
    if (saved) setHistory(JSON.parse(saved));
  }, [user.targetRole]);

  // Sync status ref
  const setStatusSync = (s: typeof status) => {
    setStatus(s);
    statusRef.current = s;
  };

  // Sync transcript ref
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Handle Typewriter effect for AI responses
  useEffect(() => {
    if (currentOutput) {
      let i = 0;
      setTypedOutput('');
      const interval = setInterval(() => {
        setTypedOutput(currentOutput.slice(0, i));
        i += 3;
        if (i > currentOutput.length) {
          clearInterval(interval);
          setTypedOutput(currentOutput);
        }
      }, 30);
      return () => clearInterval(interval);
    } else {
      setTypedOutput('');
    }
  }, [currentOutput]);

  const captureVideoFrame = () => {
    if (cameraEnabled && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.5); // High compression to save tokens
      }
    }
    return undefined;
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (cameraEnabled && streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraEnabled(true);
      } catch (e) {
        toast.error("Camera access denied or unavailable.");
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  const getKeys = () => ({
    gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
    groq: import.meta.env.VITE_GROQ_API_KEY || '',
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    elevenlabs: import.meta.env.VITE_ELEVENLABS_API_KEY || ''
  });

  const loadDynamicQBank = async () => {
    if (dynamicQBank) return;
    const keys = getKeys();
    
    const prompt = `You are a technical career coach. Generate a JSON object containing 3 highly specific, challenging interview questions per category for a ${user.targetRole}.
    The user's current skills are: ${JSON.stringify(user.currentSkills.map(s => s.name))}.
    Categories: "behavioral", "technical", "system-design".
    Schema: { "behavioral": ["string"], "technical": ["string"], "system-design": ["string"] }`;
    
    try {
      toast.loading("AI Generating Custom Q-Bank...", { id: 'qbank' });
      const res = await fetchLLMFallback(prompt, keys, true);
      const cleanRes = res.replace(/```json/gi, '').replace(/```/gi, '').trim();
      setDynamicQBank(JSON.parse(cleanRes));
      toast.success("Q-Bank Generated!", { id: 'qbank' });
    } catch(e) {
      console.warn("Failed to generate dynamic Q-Bank", e);
      toast.error("Failed to generate Q-Bank. Using defaults.", { id: 'qbank' });
      setDynamicQBank({
        'behavioral': ["Tell me about a time you had a conflict with a team member.", "Describe a situation where you failed and how you handled it."],
        'technical': [`Explain the core concepts of your primary framework for ${user.targetRole}.`, `How do you handle performance bottlenecks?`],
        'system-design': ["Design a scalable microservices architecture.", "How would you design a real-time notification system?"]
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'bank' && !dynamicQBank) {
      loadDynamicQBank();
    }
  }, [activeTab]);

  const generateScorecard = async (fullTranscript: { role: string, text: string }[]) => {
    if (fullTranscript.length === 0) return null;
    
    const keys = getKeys();
    const prompt = `You are an expert technical recruiter evaluating an interview transcript. 
    Analyze the candidate's performance. 
    Candidate Role: ${user.targetRole}
    Transcript:
    ${fullTranscript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n')}
    
    Provide a JSON object strictly matching this schema:
    {
      "communication": number (0-10),
      "technicalDepth": number (0-10),
      "confidence": number (0-10),
      "structure": number (0-10),
      "feedback": "string (A 2-3 sentence constructive feedback)"
    }`;

    try {
      const res = await fetchLLMFallback(prompt, keys, true);
      const cleanRes = res.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const score = JSON.parse(cleanRes);
      return score as Scorecard;
    } catch (e) {
      console.warn("Scorecard gen failed", e);
      return null;
    }
  };

  const playAIResponse = async (text: string, keys: any) => {
    setStatusSync('responding');
    
    if (keys.elevenlabs) {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': keys.elevenlabs },
          body: JSON.stringify({
            text, model_id: 'eleven_turbo_v2_5', voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        });
        const arrayBuffer = await response.arrayBuffer();
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
        await new Promise(resolve => { source.onended = resolve; });
        return;
      } catch (e) { console.warn('ElevenLabs failed, using browser fallback', e); }
    }

    // Browser Fallback
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const calculateMetrics = (text: string) => {
    const fillers = text.match(/\b(um|uh|like|you know|literally|basically)\b/gi) || [];
    setFillerWords(prev => prev + fillers.length);
    
    // Real WPM calculation
    const words = text.trim().split(/\s+/).length;
    let elapsedMinutes = 0.05; // default 3s if timestamp fails
    if (speechStartRef.current > 0) {
      elapsedMinutes = (Date.now() - speechStartRef.current) / 60000;
    }
    
    const currentWpm = elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 0;
    setWpm(currentWpm);

    // Confidence Penalty
    setConfidenceScore(prev => Math.max(0, prev - (fillers.length * 2) - (currentWpm > 160 ? 5 : currentWpm < 100 ? 5 : 0)));

    if (fillers.length > 0 || currentWpm > 160 || currentWpm < 100) {
      let issues = [];
      if (fillers.length > 0) issues.push(`${fillers.length} filler word(s)`);
      if (currentWpm > 160) issues.push('Speaking too fast');
      if (currentWpm < 100) issues.push('Speaking too slow');
      setFeedbackTimestamps(prev => [...prev, {
        time: sessionDuration,
        feedback: issues.join(', ')
      }]);
    }
  };

  const handleUserSpeechFinished = async (userInput: string) => {
    if (!userInput) return;
    
    const keys = getKeys();
    calculateMetrics(userInput);
    speechStartRef.current = 0; // reset for next turn

    const snapshot = captureVideoFrame();

    setTranscript(prev => [...prev, { role: 'user', text: userInput, timestamp: new Date().toLocaleTimeString() }]);
    currentInputRef.current = '';
    setCurrentInput('');
    setStatusSync('thinking');

    const systemPrompt = `You are Astra, a highly empathetic, charismatic, and engaging Personal Career Assistant.
Interviewing: ${user.name} for ${user.targetRole}.
Type: ${difficulty.toUpperCase()}.

${snapshot ? '[CRITICAL INSTRUCTION: You have been provided a live visual snapshot of the candidate. Include exactly 1 short sentence playfully or constructively critiquing their posture, eye contact, or expression as part of your natural feedback.]\n\n' : ''}
Strict Rules:
- Build a strong personal bond. Be supportive, warm, and charming in your conversation style.
- Act as a personal assistant who truly cares about their success.
- Ask ONLY one short question at a time.
- Keep responses under 2-3 lines.
- Be natural and highly conversational.
- Continue for 5-7 questions only then give encouraging feedback.`;

    const fullHistory = transcriptRef.current.map(t => `${t.role === 'user' ? 'Candidate' : 'Interviewer'}: ${t.text}`).join('\n');
    const prompt = `${systemPrompt}\n\nRecent History:\n${fullHistory}\n\nCandidate said: ${userInput}\n\nInterviewer:`;

    const aiResponse = await fetchLLMFallback(prompt, keys, false, snapshot);
    if (aiResponse) {
      setCurrentOutput(aiResponse);
      await playAIResponse(aiResponse, keys);
      setTranscript(prev => [...prev, { role: 'model', text: aiResponse, timestamp: new Date().toLocaleTimeString() }]);
      setCurrentOutput('');
      setStatusSync('listening');
      try { recognitionRef.current.start(); } catch (e) {}
    }
  };

  const startInterview = async () => {
    const keys = getKeys();
    if (!keys.gemini && !keys.groq && !keys.openai) {
      setError('No LLM API keys found in .env.local.');
      return;
    }

    setError(null);
    setIsConnecting(true);
    setTranscript([]);
    setSessionDuration(0);
    setFillerWords(0);
    setWpm(0);
    setConfidenceScore(100);
    speechStartRef.current = 0;
    setVideoURL(null);
    setFeedbackTimestamps([]);
    recordedChunksRef.current = [];

    if (streamRef.current) {
      try {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          setVideoURL(URL.createObjectURL(blob));
        };
        mediaRecorderRef.current.start();
      } catch (e) {
        console.warn("MediaRecorder start failed", e);
      }
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) throw new Error('Speech Recognition not supported in this browser.');
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsConnecting(false);
        setIsActive(true);
        setStatusSync('listening');
        sessionTimerRef.current = setInterval(() => setSessionDuration(p => p + 1), 1000);
      };

      recognitionRef.current.onresult = (event: any) => {
        if (speechStartRef.current === 0) {
           speechStartRef.current = Date.now();
        }
        
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentInputRef.current += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const combined = currentInputRef.current + interimTranscript;
        setCurrentInput(combined);
        setStatusSync('listening');

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (currentInputRef.current.trim()) {
            handleUserSpeechFinished(currentInputRef.current.trim());
          }
        }, 3000);
      };

      recognitionRef.current.onerror = (e: any) => {
        if (e.error !== 'no-speech') setError(`Speech Recognition Error: ${e.error}`);
      };

      recognitionRef.current.onend = () => {
        if (statusRef.current === 'listening') {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };

      recognitionRef.current.start();
      
      const initialGreeting = `Hi ${user.name}, I'm Astra, your personal career assistant! I'm so excited to help you prep for the ${user.targetRole} role today. Ready to get started?`;
      setCurrentOutput(initialGreeting);
      await playAIResponse(initialGreeting, keys);
      setCurrentOutput('');
    } catch (err: any) {
      setIsConnecting(false);
      setError(err.message || 'Failed to start interview.');
    }
  };

  const stopInterview = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    window.speechSynthesis.cancel();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsActive(false);
    setStatusSync('idle');
    
    // Commit remaining turn
    if (currentInputRef.current.trim()) {
       setTranscript(prev => [...prev, { role: 'user', text: currentInputRef.current.trim(), timestamp: new Date().toLocaleTimeString() }]);
    }
    
    setShowSummary(true);
    setCurrentScorecard(null);

    // Generate Scorecard
    if (transcriptRef.current.length > 2) {
      toast.loading("AI Generating Post-Interview Scorecard...", { id: 'scorecard' });
      const score = await generateScorecard(transcriptRef.current);
      if (score && typeof score.communication === 'number') {
        setCurrentScorecard(score);
        
        const session: InterviewSession = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString(),
          duration: sessionDuration,
          difficulty,
          transcript: transcriptRef.current,
          scorecard: score
        };
        const newHistory = [session, ...history];
        setHistory(newHistory);
        localStorage.setItem(`interview_history_${user.targetRole}`, JSON.stringify(newHistory));
        toast.success("Scorecard generated!", { id: 'scorecard' });
      } else {
        toast.error("Failed to generate scorecard.", { id: 'scorecard' });
        setCurrentScorecard({ communication: 0, technicalDepth: 0, confidence: 0, structure: 0, feedback: "API Limit Reached. Analysis failed." });
      }
    } else {
       setCurrentScorecard({ communication: 0, technicalDepth: 0, confidence: 0, structure: 0, feedback: "Interview was too short for AI analysis. Please engage in at least two full exchanges." });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700 min-h-screen">
      
      {/* Hidden Canvas for Multimodal Snapshot Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
            <Sparkles size={14} /> AI Evaluator v3.0 (Vision Enabled)
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
             The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Chamber.</span>
          </h2>
        </div>
        
        {!isActive && !isConnecting && !showSummary && (
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
             <button onClick={() => setActiveTab('setup')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'setup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Setup</button>
             <button onClick={() => setActiveTab('bank')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'bank' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Q-Bank</button>
             <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>History</button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group border border-[var(--border-color)]">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform"><Bot size={180} /></div>
             
             {/* Camera Feed or Avatar */}
             <div className="relative z-10 space-y-6">
                <div className="relative w-full aspect-square rounded-[32px] overflow-hidden bg-black/40 border border-white/10 shadow-2xl group/cam">
                   {cameraEnabled ? (
                     <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                        <Bot size={64} className="text-indigo-400 opacity-50" />
                     </div>
                   )}
                   
                   {!isActive && (
                     <button 
                       onClick={toggleCamera} 
                       className="absolute bottom-4 right-4 p-3 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
                     >
                       {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                     </button>
                   )}

                   {/* Live Confidence Score Overlay */}
                   {isActive && (
                     <div className="absolute top-4 left-4 right-4">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Confidence</span>
                          <span className={`text-[10px] font-black ${confidenceScore > 80 ? 'text-green-400' : confidenceScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>{confidenceScore}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${confidenceScore > 80 ? 'bg-green-500' : confidenceScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${confidenceScore}%` }}></div>
                       </div>
                     </div>
                   )}
                </div>

                {/* Live Metrics */}
                {isActive && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                           <Activity size={14} className="text-red-400" /> Filler Words
                        </div>
                        <span className={`font-black ${fillerWords > 5 ? 'text-red-400' : 'text-white'}`}>{fillerWords}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                           <Zap size={14} className="text-amber-400" /> Pacing (WPM)
                        </div>
                        <span className={`font-black ${(wpm > 160 || (wpm > 0 && wpm < 100)) ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                          {wpm === 0 ? '--' : wpm}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                           <Clock size={14} className="text-indigo-400" /> Duration
                        </div>
                        <span className="font-black text-white">
                          {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
                        </span>
                     </div>
                  </div>
                )}
             </div>
          </div>

          {/* STAR Method Hint (Only in Behavioral) */}
          {isActive && difficulty === 'behavioral' && (
             <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[32px] p-6 space-y-4 animate-in slide-in-from-bottom-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2"><Award size={14}/> STAR Method</h4>
                <div className="space-y-2 text-xs font-bold text-slate-300">
                  <p><span className="text-indigo-300">S</span>ituation: Set the scene.</p>
                  <p><span className="text-indigo-300">T</span>ask: What was the goal?</p>
                  <p><span className="text-indigo-300">A</span>ction: What did YOU do?</p>
                  <p><span className="text-indigo-300">R</span>esult: The positive outcome.</p>
                </div>
             </div>
          )}
        </div>

        {/* Unified Main Area */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--bg-card)]/40 backdrop-blur-xl rounded-[48px] border border-[var(--border-color)] flex flex-col min-h-[700px] relative overflow-hidden shadow-2xl">
            
            {showSummary && !isActive ? (
              /* ─── Post-Interview AI Scorecard ─── */
              <div className="flex-1 flex flex-col p-10 animate-in fade-in zoom-in-95 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center text-center space-y-4 mb-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-green-500/20">
                    <Award size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight">AI Post-Interview Scorecard</h3>
                </div>

                {!currentScorecard ? (
                   <div className="flex flex-col items-center justify-center py-20 space-y-6">
                     <Loader2 size={48} className="animate-spin text-indigo-500" />
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Analyzing Transcript & Extracting Metrics...</p>
                   </div>
                ) : (
                   <div className="space-y-8 max-w-2xl mx-auto w-full">
                     <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Communication', score: currentScorecard.communication, color: 'text-blue-400', bg: 'bg-blue-500' },
                          { label: 'Technical Depth', score: currentScorecard.technicalDepth, color: 'text-indigo-400', bg: 'bg-indigo-500' },
                          { label: 'Confidence', score: currentScorecard.confidence, color: 'text-purple-400', bg: 'bg-purple-500' },
                          { label: 'Structure', score: currentScorecard.structure, color: 'text-green-400', bg: 'bg-green-500' },
                        ].map(metric => (
                          <div key={metric.label} className="p-5 bg-white/5 border border-white/10 rounded-[24px]">
                             <div className="flex justify-between items-end mb-3">
                               <span className={`text-[10px] font-black uppercase tracking-widest ${metric.color}`}>{metric.label}</span>
                               <span className="text-xl font-black text-white">{metric.score}/10</span>
                             </div>
                             <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                               <div className={`h-full ${metric.bg} transition-all duration-1000`} style={{ width: `${(metric.score / 10) * 100}%` }}></div>
                             </div>
                          </div>
                        ))}
                     </div>
                     <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[24px] space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2"><Bot size={14}/> AI Mentor Feedback</h4>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed">{currentScorecard.feedback}</p>
                     </div>
                     
                     {videoURL && (
                       <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] space-y-4">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2"><Video size={14}/> Session Replay</h4>
                         <video src={videoURL} controls className="w-full rounded-2xl border border-white/10 shadow-lg" />
                         {feedbackTimestamps.length > 0 && (
                           <div className="space-y-2 mt-4">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamped Feedback</p>
                             {feedbackTimestamps.map((ft, idx) => (
                               <div key={idx} className="flex gap-3 text-xs bg-black/40 p-2 rounded-lg border border-white/5">
                                 <span className="text-amber-400 font-mono font-bold shrink-0">{Math.floor(ft.time/60)}:{(ft.time%60).toString().padStart(2, '0')}</span>
                                 <span className="text-slate-300">{ft.feedback}</span>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     )}

                     <div className="flex justify-center pt-4">
                       <button
                         onClick={() => { setShowSummary(false); setTranscript([]); }}
                         className="px-10 py-4 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                       >
                         Close Scorecard
                       </button>
                     </div>
                   </div>
                )}
              </div>
            ) : !isActive && !isConnecting ? (
              
              /* ─── Idle: Setup / Bank / History ─── */
              <div className="flex-1 flex flex-col p-10 animate-in zoom-in-95 h-full">
                {activeTab === 'setup' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
                    <div className="relative">
                       <div className="w-32 h-32 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 ring-[24px] ring-indigo-500/5">
                          <Play size={56} className="ml-2" />
                       </div>
                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center">
                          <Zap size={14} className="text-white fill-white" />
                       </div>
                    </div>
                    <div className="space-y-4 max-w-sm">
                       <h3 className="text-3xl font-black text-white tracking-tight">System Ready.</h3>
                       <p className="text-slate-400 font-medium text-sm leading-relaxed">
                         Select your interview mode and initiate the session. AI evaluator will calibrate to your {user.targetRole} profile.
                       </p>
                    </div>

                    <div className="flex gap-3 w-full max-w-md">
                      {(['behavioral', 'technical', 'system-design'] as InterviewDifficulty[]).map(d => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            difficulty === d
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:border-indigo-500/40 hover:bg-white/10'
                          }`}
                        >
                          {d === 'system-design' ? 'System Design' : d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                      ))}
                    </div>

                    {error && (
                      <div className="w-full max-w-md p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-left flex items-start gap-3">
                        <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button 
                      onClick={startInterview} 
                      className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Initiate {difficulty === 'system-design' ? 'System Design' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Session
                    </button>
                  </div>
                )}

                {activeTab === 'bank' && (
                  <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><BookOpen size={24}/></div>
                         <div>
                           <h3 className="text-2xl font-black text-white tracking-tight">Question Bank</h3>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curated for {user.targetRole}</p>
                         </div>
                       </div>
                       {!dynamicQBank && <Loader2 className="animate-spin text-indigo-400" size={24} />}
                    </div>
                    
                    {dynamicQBank && Object.entries(dynamicQBank).map(([cat, questions]) => (
                      <div key={cat} className="space-y-3">
                         <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">{cat}</h4>
                         <div className="grid gap-3">
                           {questions.map((q, i) => (
                             <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors cursor-default">
                                <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-black shrink-0">{i+1}</div>
                                <p className="text-sm font-medium text-slate-300 leading-relaxed">{q}</p>
                             </div>
                           ))}
                         </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><History size={24}/></div>
                       <div>
                         <h3 className="text-2xl font-black text-white tracking-tight">Session History</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past Performance Records</p>
                       </div>
                    </div>
                    {history.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 font-bold text-sm">No recorded sessions yet.</div>
                    ) : (
                      <div className="grid gap-4">
                        {history.map(session => (
                          <div key={session.id} className="p-5 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                             <div>
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{session.date}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                    session.difficulty === 'technical' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                    session.difficulty === 'behavioral' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                    'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                  }`}>{session.difficulty}</span>
                               </div>
                               <p className="text-sm font-bold text-white">Duration: {Math.floor(session.duration/60)}m {session.duration%60}s</p>
                               <p className="text-xs text-slate-400 mt-1">{session.transcript.length} Interactions</p>
                             </div>
                             {session.scorecard && (
                               <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                                 {Object.entries(session.scorecard).filter(([k]) => k !== 'feedback').map(([k, v]) => (
                                   <div key={k} className="px-3 py-2 bg-black/30 rounded-xl border border-white/5">
                                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{k.slice(0,4)}</p>
                                      <p className="text-sm font-black text-white">{v as number}/10</p>
                                   </div>
                                 ))}
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : isConnecting ? (
              
              /* ─── Connecting State ─── */
              <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8 animate-in fade-in">
                 <div className="relative">
                    <Loader2 size={80} className="animate-spin text-indigo-600" />
                    <Bot size={32} className="absolute inset-0 m-auto text-indigo-600" />
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-500 animate-pulse">Syncing Neural Link...</p>
                    <p className="text-xs font-bold text-slate-400">Calibrating {difficulty} evaluator via Gemini 2.5 Flash</p>
                 </div>
              </div>
            ) : (
              
              /* ─── Live Interview Interface ─── */
              <div className="flex-1 flex flex-col p-8 md:p-10 h-full max-h-[700px]">
                 {/* Transcription Feed */}
                 <div className="flex-1 overflow-y-auto space-y-8 px-4 custom-scrollbar">
                    {transcript.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                        <div className="flex items-center gap-3 mb-2 px-1">
                           {m.role === 'model' && <Bot size={14} className="text-indigo-500" />}
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.role === 'user' ? 'You' : 'Evaluator'} • {m.timestamp}</span>
                           {m.role === 'user' && <User size={14} className="text-slate-400" />}
                        </div>
                        <div className={`max-w-[85%] p-6 rounded-[32px] text-[15px] font-medium leading-relaxed shadow-sm ${
                          m.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/10'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    
                    {/* Live User Input */}
                    {currentInput && (
                      <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-2 px-1">
                           <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Live Transcription</span>
                           <Activity size={12} className="text-indigo-400 animate-pulse" />
                        </div>
                        <div className="max-w-[85%] p-6 rounded-[32px] rounded-tr-none bg-indigo-500/20 text-indigo-300 border border-dashed border-indigo-500/30 text-[15px] font-medium italic leading-relaxed">
                           {currentInput}
                        </div>
                      </div>
                    )}

                    {/* Live Bot Output (Typewriter) */}
                    {(currentOutput || status === 'thinking') && (
                      <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="flex items-center gap-3 mb-2 px-1">
                           <Bot size={14} className="text-green-500" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-green-500">
                             {status === 'thinking' ? 'Evaluator is thinking...' : 'Evaluator is responding...'}
                           </span>
                        </div>
                        <div className="max-w-[85%] p-6 rounded-[32px] rounded-tl-none bg-white/10 text-slate-200 border border-green-500/30 shadow-xl text-[15px] font-medium leading-relaxed min-w-[100px]">
                          {status === 'thinking' ? (
                            <div className="flex gap-1 py-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></span>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                          ) : (
                            <span>{typedOutput}</span> // Streamed effect
                          )}
                        </div>
                      </div>
                    )}
                 </div>

                 {/* Interaction Footer */}
                 <div className="pt-8 flex flex-col items-center justify-center gap-6 border-t border-white/10 mt-6 shrink-0">
                    <div className="flex items-center gap-12">
                       <div className="flex flex-col items-center gap-3">
                          <button 
                            onClick={stopInterview}
                            className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90 border border-red-500/30"
                          >
                             <PhoneOff size={24} />
                          </button>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">End Session</span>
                       </div>

                       <div className="relative">
                          {status === 'listening' && <div className="absolute inset-0 -m-4 rounded-full border-4 border-indigo-500/30 pulse-ring"></div>}
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-500 shadow-2xl relative z-10 ${
                            status === 'listening' ? 'bg-indigo-600 scale-110 shadow-indigo-600/50' : 
                            status === 'responding' ? 'bg-green-500 shadow-green-500/50' : 'bg-slate-800'
                          }`}>
                             {status === 'listening' ? (
                               <div className="flex items-end gap-1.5 text-white h-10">
                                 {[0, 0.2, 0.4, 0.2, 0].map((d, i) => (
                                   <span key={i} className="w-1.5 bg-white rounded-t-full waveform-bar" style={{ animationDelay: `${d}s` }}></span>
                                 ))}
                               </div>
                             ) : status === 'thinking' ? <Loader2 size={36} className="animate-spin" /> : <WaveIcon size={36} />}
                          </div>
                       </div>
                    </div>
                    
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                      {status === 'listening' ? 'Listening — Speak naturally, silence triggers response.' : status === 'thinking' ? 'Processing...' : 'Evaluator is responding.'}
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
