import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "models/gemini-1.5-flash-001",
});

const result = await model.generateContent("Say hello in one sentence");
console.log(result.response.text());
