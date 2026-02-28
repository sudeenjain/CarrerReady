import { GoogleGenAI } from "@google/genai";

// Use API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Replace with a model enabled for your project
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
