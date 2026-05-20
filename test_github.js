import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { analysisService } from './analysisService.js';
import fetch from 'node-fetch';

(async () => {
    try {
        const username = "sudeenjain";
        const token = process.env.VITE_GITHUB_TOKEN;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const profileResp = await fetch(`https://api.github.com/users/${username}`, { headers });
        let userProfile = null;
        if (profileResp.ok) {
            userProfile = await profileResp.json();
        }

        const resp = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers });
        if (!resp.ok) {
            throw new Error(`GitHub API error: ${resp.statusText}`);
        }
        const repos = await resp.json();

        const result = await analysisService.analyzeGitHubRepos(repos, username, userProfile);
        console.log(JSON.stringify(result, null, 2));
    } catch(e) {
        console.error(e);
    }
})();
