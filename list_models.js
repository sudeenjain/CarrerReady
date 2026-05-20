const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: "AIzaSyDiHlZOPEgELn0PUtCqKc_j9KzPYbptBMo" });

async function listModels() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDiHlZOPEgELn0PUtCqKc_j9KzPYbptBMo");
    const data = await response.json();
    console.log(data.models.map(m => m.name));
  } catch (e) {
    console.error(e);
  }
}
listModels();
