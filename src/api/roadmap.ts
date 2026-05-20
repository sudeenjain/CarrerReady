import { RoadmapStep } from '../../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const roadmapApi = {
  getRoadmap: async () => {
    const res = await fetch(`${API_BASE}/api/v1/roadmap/`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch roadmap');
    return res.json();
  },

  saveRoadmap: async (payload: { targetRole: string, streak: number, totalLearningHours: number, days: RoadmapStep[] }) => {
    const res = await fetch(`${API_BASE}/api/v1/roadmap/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save roadmap');
    return res.json();
  },

  updateProgress: async (day: number, data: { completionStatus?: Record<string, boolean>, watchedVideos?: string[], notes?: string, weakTopics?: string[] }) => {
    const res = await fetch(`${API_BASE}/api/v1/roadmap/progress/${day}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return res.json();
  },

  getYouTubeRecommendation: async (topic: string) => {
    const res = await fetch(`${API_BASE}/api/v1/roadmap/youtube?topic=${encodeURIComponent(topic)}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch video recommendation');
    return res.json();
  },

  chatWithMentor: async (topic: string, query: string, history: any[] = []) => {
    const res = await fetch(`${API_BASE}/api/v1/roadmap/ai/mentor`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ topic, query, history })
    });
    if (!res.ok) throw new Error('Failed to chat with mentor');
    return res.json();
  }
};
