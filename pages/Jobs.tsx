import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, JobOpening, SkillLevel, ApplicationRecord } from '../types';
import { SAMPLE_JOBS } from '../constants';
import { analysisService } from '../analysisService';
import {
  Briefcase,
  Building2,
  MapPin,
  ExternalLink,
  CheckCircle,
  Clock,
  Search,
  ChevronRight,
  X,
  Loader2,
  Sparkles,
  Target,
  Zap,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  ListFilter,
  History,
  TrendingUp,
  FileCheck,
  Filter,
  DollarSign,
  Award,
  PenTool,
  RotateCcw
} from 'lucide-react';

type SortOption = 'Match' | 'Salary' | 'Rating' | 'Recent';

const Jobs: React.FC<{ user: UserProfile, onUpdateUser: (u: UserProfile) => void }> = ({ user, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Match');
  const [view, setView] = useState<'available' | 'applied'>('available');
  const [loadingPulse, setLoadingPulse] = useState(true);
  const [internships, setInternships] = useState<string[]>([]);
  const [jobBenchmark, setJobBenchmark] = useState<string | null>(null);
  const [liveJobs, setLiveJobs] = useState<JobOpening[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftedCoverLetter, setDraftedCoverLetter] = useState<string | null>(null);

  // Granular Filter States
  const [minSalary, setMinSalary] = useState<number>(0);
  const [maxSalary, setMaxSalary] = useState<number>(100);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  // Unique tech list from sample jobs for filter options
  const allAvailableTech = useMemo(() => {
    const techSet = new Set<string>();
    SAMPLE_JOBS.forEach(job => job.requiredSkills.forEach(s => techSet.add(s.name)));
    return Array.from(techSet).sort();
  }, []);

  useEffect(() => {
    const fetchLiveJobs = async () => {
      try {
        const adzunaId = import.meta.env.VITE_ADZUNA_APP_ID;
        const adzunaKey = import.meta.env.VITE_ADZUNA_APP_KEY;
        if (!adzunaId || !adzunaKey) return;

        const res = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${adzunaId}&app_key=${adzunaKey}&what=${encodeURIComponent(user.targetRole)}`);
        const data = await res.json();

        if (data.results) {
          const mappedJobs = data.results.map((j: any) => ({
            id: j.id.toString(),
            title: j.title.replace(/<\/?[^>]+(>|$)/g, ""),
            company: j.company.display_name,
            location: j.location.display_name,
            type: j.contract_type === 'contract' ? 'Contract' : 'Full-time',
            salaryRange: j.salary_min ? `$${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k` : 'Competitive',
            requiredSkills: [{ name: user.targetRole, minLevel: 'Intermediate' }],
            applyUrl: j.redirect_url,
            minSalary: j.salary_min ? Math.round(j.salary_min / 100000) : 0,
            rating: 4.5,
            postedDate: new Date(j.created).toLocaleDateString()
          }));
          setLiveJobs(mappedJobs);
        }
      } catch (e) { console.warn('Adzuna fetch failed', e); }
    };
    fetchLiveJobs();
  }, [user.targetRole]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingPulse(true);
      try {
        const pulse = await analysisService.fetchLiveMarketPulse(user.targetRole);
        setInternships(pulse.internshipRecommendations || []);
      } catch (err) {
        console.error("Pulse failed", err);
      } finally {
        setLoadingPulse(false);
      }
    };
    fetchRecommendations();
  }, [user.targetRole]);

  useEffect(() => {
    if (selectedJob) {
      setJobBenchmark(null);
      analysisService.getJobBenchmark(selectedJob.title, selectedJob.company, selectedJob.requiredSkills, user.currentSkills)
        .then(res => setJobBenchmark(res))
        .catch(() => setJobBenchmark('Benchmark unavailable.'));
    }
  }, [selectedJob, user.currentSkills]);

  const calculateMatch = (job: JobOpening) => {
    let matches = 0;
    job.requiredSkills.forEach(req => {
      const userSkill = user.currentSkills.find(s => s.name.toLowerCase() === req.name.toLowerCase());
      if (userSkill) {
        const levels = [SkillLevel.BASIC, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED];
        if (levels.indexOf(userSkill.level) >= levels.indexOf(req.minLevel)) {
          matches++;
        }
      }
    });
    return Math.round((matches / (job.requiredSkills.length || 1)) * 100);
  };

  const isApplied = (jobId: string) => user.applications?.some(a => a.jobId === jobId);

  const handleApply = (job: JobOpening) => {
    if (isApplied(job.id)) return;

    const application: ApplicationRecord = {
      jobId: job.id,
      status: 'Applied',
      appliedDate: new Date().toISOString()
    };
    const updatedUser: UserProfile = {
      ...user,
      applications: [...(user.applications || []), application]
    };
    onUpdateUser(updatedUser);
    window.open(job.applyUrl, '_blank');
  };

  const handleDraftCoverLetter = async () => {
    if (!selectedJob) return;
    setIsDrafting(true);
    setDraftedCoverLetter(null);
    try {
      const userResume = user.currentSkills.map(s => `${s.name} (${s.level})`).join(', ');
      const letter = await analysisService.generateCoverLetter(userResume, selectedJob.title, selectedJob.company);
      setDraftedCoverLetter(letter);
    } catch (e) {
      console.error(e);
      setDraftedCoverLetter("Failed to draft cover letter. Please check your AI API keys.");
    }
    setIsDrafting(false);
  };

  const handleToggleTech = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const clearFilters = () => {
    setMinSalary(0);
    setMaxSalary(100);
    setMinRating(0);
    setSelectedTech([]);
    setSearchTerm('');
  };

  const filteredJobs = useMemo(() => {
    const allJobs = [...SAMPLE_JOBS, ...liveJobs];
    let results = allJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const salary = job.minSalary || 0;
      const matchesSalary = salary >= minSalary && salary <= maxSalary;

      const rating = job.rating || 0;
      const matchesRating = rating >= minRating;

      const matchesTech = selectedTech.length === 0 ||
        selectedTech.some(tech => job.requiredSkills.some(rs => rs.name === tech));

      const inView = view === 'applied' ? isApplied(job.id) : true;

      return matchesSearch && matchesSalary && matchesRating && matchesTech && inView;
    });

    return results.sort((a, b) => {
      if (sortBy === 'Match') return calculateMatch(b) - calculateMatch(a);
      if (sortBy === 'Salary') return (b.minSalary || 0) - (a.minSalary || 0);
      if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [searchTerm, minSalary, maxSalary, minRating, selectedTech, sortBy, view, user.applications, user.currentSkills]);

  const applicationCount = user.applications?.length || 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0f172a]/40 border border-[var(--border-color)] rounded-[32px] p-6 backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp size={12} className="text-indigo-400" /> Outreach Velocity
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white">{applicationCount}</span>
            <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">Applications</span>
          </div>
        </div>
        <div className="bg-[#0f172a]/40 border border-[var(--border-color)] rounded-[32px] p-6 backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileCheck size={12} className="text-green-400" /> Quality Match
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white">{applicationCount > 0 ? Math.round((applicationCount / (SAMPLE_JOBS.length || 1)) * 100) : 0}%</span>
            <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">Success Rate</span>
          </div>
        </div>
        <div className="bg-[#0f172a]/40 border border-[var(--border-color)] rounded-[32px] p-6 backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Clock size={12} className="text-amber-400" /> Active Leads
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white">{applicationCount}</span>
            <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">Pipelines</span>
          </div>
        </div>
        <div className="bg-indigo-600 rounded-[32px] p-6 shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
            <Sparkles size={60} />
          </div>
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Architect Bonus</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white">+{applicationCount * 50}</span>
            <span className="text-[10px] font-bold text-indigo-100 mb-1 uppercase tracking-tight">XP Earned</span>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="bg-[#0f172a]/40 p-4 rounded-[32px] border border-[var(--border-color)] backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex items-center bg-black/20 p-1.5 rounded-2xl w-full lg:w-auto">
            <button
              onClick={() => setView('available')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'available' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
            >
              <ListFilter size={14} /> Discovery
            </button>
            <button
              onClick={() => setView('applied')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'applied' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
            >
              <History size={14} /> Applications
            </button>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto flex-1 max-w-4xl">
            <div className="relative flex-1 min-w-[240px] group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search roles or companies..."
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-black/20 border border-[var(--border-color)] focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-xs font-bold text-white placeholder-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-black/20 border border-[var(--border-color)] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 outline-none cursor-pointer pr-12 transition-all hover:border-[var(--border-color)]"
                >
                  <option value="Match">Match Score</option>
                  <option value="Salary">Salary Level</option>
                  <option value="Rating">Top Rated</option>
                </select>
                <ArrowUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border ${showFilters || selectedTech.length > 0 || minSalary > 0 || minRating > 0
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-black/20 border-[var(--border-color)] text-slate-400'
                  }`}
              >
                <Filter size={14} /> Filters
                {(selectedTech.length > 0 || minSalary > 0 || minRating > 0) && (
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[8px] flex items-center justify-center animate-in zoom-in">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Granular Filters Panel */}
        {showFilters && (
          <div className="pt-6 border-t border-[var(--border-color)] animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-4">
              {/* Salary Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <DollarSign size={12} className="text-green-400" /> Salary Floor (Lakhs)
                  </h4>
                  <span className="text-xs font-bold text-white">₹{minSalary}L+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={minSalary}
                  onChange={(e) => setMinSalary(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                  <span>₹0L</span>
                  <span>₹30L</span>
                  <span>₹60L+</span>
                </div>
              </div>

              {/* Company Rating */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Star size={12} className="text-amber-400" /> Minimum Company Rating
                </h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMinRating(minRating === star ? 0 : star)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${minRating >= star ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-black/20 text-slate-600 border border-[var(--border-color)]'
                        }`}
                    >
                      <Star size={16} fill={minRating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Zap size={12} className="text-indigo-400" /> Technology Pulse
                  </h4>
                  <button onClick={clearFilters} className="text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-1">
                    <Rotat eCcw size={10} /> Reset
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar pr-2">
                  {allAvailableTech.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => handleToggleTech(tech)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight border transition-all ${selectedTech.includes(tech)
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-black/20 text-slate-500 border-[var(--border-color)] hover:border-[var(--border-color)]'
                        }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loadingPulse && view === 'available' ? (
        <div className="p-12 text-center bg-white/5 rounded-[40px] animate-pulse">
          <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving Skill-Matched Internships...</p>
        </div>
      ) : internships.length > 0 && view === 'available' && (
        <div className="bg-indigo-900/40 border border-indigo-500/20 rounded-[40px] p-8 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-amber-400" size={24} />
            <h3 className="text-xl font-black text-white tracking-tight">Neural Internship Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {internships.map((rec, i) => (
              <div key={i} className="bg-white/5 border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                <p className="text-xs font-bold text-slate-300">{rec}</p>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-600 border border-[var(--border-color)]">
            <Briefcase size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">No {view === 'applied' ? 'Applications' : 'Roles'} Found.</h3>
            <p className="text-slate-500 text-sm mt-2">Try loosening your filters or syncing more skills.</p>
            {(searchTerm || selectedTech.length > 0 || minSalary > 0 || minRating > 0) && (
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 text-indigo-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job) => {
            const matchPercent = calculateMatch(job);
            const applied = isApplied(job.id);
            const applicationRecord = user.applications?.find(a => a.jobId === job.id);

            return (
              <div
                key={job.id}
                className={`bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] p-8 border transition-all duration-500 group flex flex-col relative overflow-hidden cursor-pointer ${applied ? 'border-green-500/20' : 'border-[var(--border-color)] hover:border-indigo-500/30'
                  }`}
                onClick={() => setSelectedJob(job)}
              >
                {/* Applied Badge */}
                {applied && (
                  <div className="absolute top-0 right-0 px-6 py-2 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center gap-2 animate-in slide-in-from-right-4">
                    <CheckCircle size={10} /> Tracked Successfully
                  </div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${applied
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-white/5 text-slate-500 border border-[var(--border-color)] group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20'
                    }`}>
                    <Building2 size={28} />
                  </div>
                  {!applied && (
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${matchPercent > 80 ? 'bg-green-500/10 text-green-400' :
                        matchPercent > 50 ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-white/5 text-slate-500'
                      }`}>
                      {matchPercent}% Match
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight leading-none">{job.title}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="text-slate-300">{job.company}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span>{job.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-2">
                    <MapPin size={12} /> {job.location}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tight border border-[var(--border-color)]">
                        {s.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Architect Target</p>
                      <p className="text-lg font-black text-white">{job.salaryRange}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                      className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn ${applied
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/10 hover:scale-105 active:scale-95'
                        }`}
                    >
                      {applied ? (
                        <span className="flex items-center gap-2"><CheckCircle size={14} /> Applied</span>
                      ) : (
                        <span className="flex items-center gap-2">Apply Now <ExternalLink size={12} /></span>
                      )}
                    </button>
                  </div>
                </div>

                {applied && applicationRecord && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Applied: {new Date(applicationRecord.appliedDate).toLocaleDateString()}</span>
                    <span className="text-green-400">Processing Signal...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0f172a] w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-[var(--border-color)] flex flex-col max-h-[90vh]">
            <div className="p-10 gradient-bg text-white relative">
              <button onClick={() => setSelectedJob(null)} className="absolute top-10 right-10 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={24} /></button>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Match Score: {selectedJob ? calculateMatch(selectedJob) : 0}%
                </div>
                <h3 className="text-4xl font-black tracking-tighter leading-none">{selectedJob?.title}</h3>
                <p className="text-xl text-white/80 font-bold">{selectedJob?.company} • {selectedJob?.location}</p>
              </div>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-[#0f172a] space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Hiring Specifications</h4>
                  <div className="space-y-4">
                    {selectedJob?.requiredSkills?.map((req, i) => {
                      const userHas = user.currentSkills.some(s => s.name.toLowerCase() === req.name.toLowerCase());
                      return (
                        <div key={i} className="p-5 rounded-3xl bg-white/[0.03] border border-[var(--border-color)] flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${userHas ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                            <p className="text-sm font-black text-white">{req.name}</p>
                          </div>
                          <span className="text-[10px] font-black uppercase text-indigo-400">{req.minLevel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-indigo-500/5 rounded-[40px] border border-indigo-500/20 space-y-4">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Zap size={14} /> Advanced Real-World Benchmark
                    </h5>
                    {jobBenchmark ? (
                      <p className="text-sm text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                        {jobBenchmark}
                      </p>
                    ) : (
                      <div className="flex items-center gap-3 text-indigo-400">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Synthesizing benchmark...</span>
                      </div>
                    )}
                    <div className="pt-4 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a] bg-indigo-500/20"></div>)}
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">5 candidates matched this week</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-8 rounded-[40px] border border-[var(--border-color)]">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Market Signal</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Base Compensation</span>
                        <span className="text-sm font-black text-white">{selectedJob?.salaryRange}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Posting Recency</span>
                        <span className="text-sm font-black text-indigo-400">{selectedJob?.postedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-500/10 p-8 rounded-[40px] border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <PenTool size={14} /> Auto-Draft Cover Letter
                      </h5>
                      <button
                        onClick={handleDraftCoverLetter}
                        disabled={isDrafting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                      >
                        {isDrafting ? 'Drafting...' : 'Generate'}
                      </button>
                    </div>
                    {draftedCoverLetter && (
                      <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-300 whitespace-pre-wrap font-medium">{draftedCoverLetter}</p>
                        <button onClick={() => { navigator.clipboard.writeText(draftedCoverLetter); }} className="mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Copy to Clipboard</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-[var(--border-color)] bg-black/20 flex items-center justify-between gap-6">
              <button onClick={() => setSelectedJob(null)} className="px-10 py-5 bg-white/5 text-slate-400 border border-[var(--border-color)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Close Portal</button>
              <button
                onClick={(e) => { e.stopPropagation(); selectedJob && handleApply(selectedJob); }}
                className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${selectedJob && isApplied(selectedJob.id)
                    ? 'bg-green-500 text-white'
                    : 'gradient-bg text-white shadow-indigo-500/20 hover:scale-[1.02] active:scale-95'
                  }`}
              >
                {selectedJob && isApplied(selectedJob.id) ? (
                  <><CheckCircle size={18} /> Application Tracked</>
                ) : (
                  <><ExternalLink size={18} /> Initiate Application</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;