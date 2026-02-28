import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

async function listModels() {
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const models = await genAI.listModels();

    console.log(
      models.models.map(m => ({
        name: m.name,
        methods: m.supportedGenerationMethods
      }))
    );

  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
