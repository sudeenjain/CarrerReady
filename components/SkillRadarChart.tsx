"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { UserProfile, SkillLevel } from '../types';
import { JOB_ROLES } from '../constants';

const SkillRadarChart: React.FC<{ user: UserProfile }> = ({ user }) => {
  const role = JOB_ROLES.find(r => r.title === user.targetRole) || JOB_ROLES[0];
  
  const chartData = role.requirements.map(req => {
    const userSkill = user.currentSkills.find(s => s.name.toLowerCase() === req.skillName.toLowerCase());
    
    const getLevelValue = (level: string | undefined) => {
      if (!level || level === 'None') return 0;
      if (level === SkillLevel.BASIC) return 33;
      if (level === SkillLevel.INTERMEDIATE) return 66;
      if (level === SkillLevel.ADVANCED) return 100;
      return 0;
    };

    return {
      subject: req.skillName,
      A: getLevelValue(userSkill?.level),
      B: getLevelValue(req.minLevel),
      fullMark: 100,
    };
  });

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#ffffff10" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderRadius: '12px', 
              border: '1px solid #ffffff10', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              fontSize: '10px'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Radar
            name="You"
            dataKey="A"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.5}
          />
          <Radar
            name="Benchmark"
            dataKey="B"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.1}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;