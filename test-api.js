import 'dotenv/config'; // Loads .env or .env.local
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in your environment variables");
  process.exit(1);
}

async function testAPI() {
  try {
    // Initialize the SDK with your API key
    const ai = new GoogleGenAI({ apiKey });

    // Generate AI content with a supported Gemini model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',      // valid model name
      contents: 'Hello AI Career Mentor! Give me a motivational message.'
    });

    console.log("API response:", response.text); // Get the text result

  } catch (err) {
    console.error("API call failed:", err);
  }
}

testAPI();
