import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { UserProfile, JobRole, SkillLevel } from '../types';

const levelToNumber = (level: SkillLevel | undefined | 'None'): number => {
    if (level === 'Advanced') return 3;
    if (level === 'Intermediate') return 2;
    if (level === 'Basic') return 1;
    return 0;
};

export function SkillCoverageChart({ user, role }: { user: UserProfile, role: JobRole }) {
    const data = useMemo(() => {
        // Show top 6 requirements to keep the radar chart clean
        const topReqs = [...role.requirements]
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 6);

        return topReqs.map(req => {
            const userSkill = user.currentSkills.find(s => s.name.toLowerCase() === req.skillName.toLowerCase());

            return {
                subject: req.skillName,
                benchmark: levelToNumber(req.minLevel),
                expertise: levelToNumber(userSkill?.level),
                fullMark: 3
            };
        });
    }, [user, role]);

    return (
        <div className="w-full mt-8 bg-[var(--input-bg)] rounded-[32px] border border-[var(--border-color)] flex flex-col relative overflow-hidden group shadow-inner transition-colors duration-500">
            <div className="px-8 pt-8 pb-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 transition-colors">Skill Coverage</h4>
                <p className="text-xl font-black text-[var(--text-main)] mt-1 transition-colors">Expertise vs. Industry Benchmark</p>
            </div>

            <div className="w-full h-72 pb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
                        <PolarGrid stroke="var(--border-color)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 3]}
                            tick={false}
                            axisLine={false}
                        />

                        <Radar
                            name="Industry Benchmark"
                            dataKey="benchmark"
                            stroke="#64748b"
                            fill="#94a3b8"
                            fillOpacity={0.15}
                        />
                        <Radar
                            name="Your Expertise"
                            dataKey="expertise"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.45}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--glass-bg)',
                                borderColor: 'var(--border-color)',
                                borderRadius: '16px',
                                fontSize: '12px',
                                backdropFilter: 'blur(12px)',
                                color: 'var(--text-main)'
                            }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '11px', fontWeight: 800, marginTop: '20px', color: 'var(--text-muted)' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
