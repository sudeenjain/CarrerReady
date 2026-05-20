import { GoogleGenAI, Type } from "@google/genai";
import * as fs from 'fs';

const ai = new GoogleGenAI({ apiKey: "AIzaSyDiHlZOPEgELn0PUtCqKc_j9KzPYbptBMo" }); // Copied from .env.local output
(async () => {
    try {
        const prompt = `You are an Elite Technical Auditor... (Mock prompt)`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skills: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    level: { type: Type.STRING, enum: ["Basic", "Intermediate", "Advanced"] },
                                    category: { type: Type.STRING }
                                },
                                required: ["name", "level", "category"]
                            }
                        },
                        topProjects: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    techStack: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["name", "description", "techStack"]
                            }
                        }
                    },
                    required: ["skills", "topProjects"]
                }
            }
        });
        console.log(response.text);
    } catch(e) {
        console.error(e);
    }
})();
