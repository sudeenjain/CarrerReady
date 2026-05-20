import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fetch from 'node-fetch';

(async () => {
    try {
        const username = "sudeenjain";
        const token = process.env.VITE_GITHUB_TOKEN;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const profileResp = await fetch(`https://api.github.com/users/${username}`, { headers: headers as any });
        let userProfile = null;
        if (profileResp.ok) {
            userProfile = await profileResp.json();
        }

        const resp = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers: headers as any });
        if (!resp.ok) {
            throw new Error(`GitHub API error: ${resp.statusText}`);
        }
        const repos = await resp.json();

        // Simulate Groq fetch
        const apiKey = process.env.VITE_GROQ_API_KEY;
        const repoData = repos.slice(0, 30).map((r: any) => ({
          name: r.name,
          description: r.description || "No description provided",
          language: r.language || "Unknown",
          topics: r.topics || [],
          stars: r.stargazers_count || 0
        }));

        const prompt = `You are an Elite Technical Auditor. Analyze the GitHub profile for "${username || 'Unknown'}".
        ${userProfile ? `Profile: ${(userProfile as any).name}, Bio: ${(userProfile as any).bio}, Company: ${(userProfile as any).company}` : ''}
        
        Data: ${JSON.stringify(repoData)}
        
        Respond strictly in JSON format:
        {
          "skills": [{"name": "string", "level": "Basic|Intermediate|Advanced", "category": "string"}],
          "topProjects": [{"name": "string", "description": "string", "techStack": ["string"]}]
        }
        Make sure to include the username "${username}" in the analysis details to prove identity verification.`;

        console.log("Sending Groq request...");
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'system', content: prompt }],
              max_tokens: 4000,
              temperature: 0.7,
              response_format: { type: "json_object" }
            })
          });
          
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Groq API Error: ${res.status} - ${JSON.stringify(err)}`);
        }
        
        const data = await res.json();
        const content = (data as any).choices?.[0]?.message?.content;
        console.log("Groq response content:", content);
    } catch(e) {
        console.error(e);
    }
})();
