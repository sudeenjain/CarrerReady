import React, { useEffect, useState } from 'react';
import { apiFetch } from '../src/api/client';
import { Users, TrendingUp, Target, Award, Search, Clock, BarChart3, ShieldCheck } from 'lucide-react';

interface UserPublic {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  target_role: string | null;
  xp: number;
  streak_days: number;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiFetch<UserPublic[]>('/api/v1/users');
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const avgXp = totalUsers ? Math.round(users.reduce((acc, u) => acc + u.xp, 0) / totalUsers) : 0;
  const totalStreaks = users.reduce((acc, u) => acc + (u.streak_days || 0), 0);
  const avgStreak = totalUsers ? (totalStreaks / totalUsers).toFixed(1) : "0";
  const activeUsers = users.filter(u => u.streak_days > 0).length;

  const kpis = [
    { title: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: "Avg. User XP", value: avgXp, icon: Award, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { title: "Active Streaks", value: activeUsers, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
    { title: "Avg. Streak", value: `${avgStreak} days`, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest">Loading Telemetry...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-10 bg-red-500/10 border border-red-500/20 rounded-3xl text-center max-w-lg mx-auto mt-20">
      <ShieldCheck size={48} className="mx-auto text-red-500 mb-4" />
      <h3 className="text-xl font-black text-red-500 mb-2">Access Denied</h3>
      <p className="text-red-400/80 text-sm">{error}</p>
      <p className="text-[10px] uppercase tracking-widest font-black text-red-500/60 mt-6">Ensure you have ADMIN role</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 h-full overflow-y-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-3">
            <ShieldCheck size={12} /> Global Analytics
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-[var(--text-main)] tracking-tight">Admin Dashboard</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-[10px] font-black uppercase tracking-widest">
          <BarChart3 size={14} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-3xl p-6 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.bg} ${kpi.border} border mb-4`}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{kpi.title}</p>
            <p className="text-3xl font-black text-[var(--text-main)] tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[32px] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
            <Users size={18} className="text-indigo-500" />
            User Leaderboard
          </h2>
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-[var(--text-main)] focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--input-bg)]/50">
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">User</th>
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Target Role</th>
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total XP</th>
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Streak</th>
                <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {users.sort((a,b) => b.xp - a.xp).map((user) => (
                <tr key={user.id} className="hover:bg-[var(--glass-bg)] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-black text-xs flex items-center justify-center border border-indigo-500/20">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-main)] group-hover:text-indigo-400 transition-colors">{user.full_name || 'Anonymous User'}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium truncate w-32 md:w-auto">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {user.target_role || 'Undeclared'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-yellow-500" />
                      <span className="text-sm font-black text-[var(--text-main)]">{user.xp.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      <span className="text-xs font-bold text-[var(--text-main)]">{user.streak_days} days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-[var(--text-muted)] font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-medium text-[var(--text-muted)]">
                    No users found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
