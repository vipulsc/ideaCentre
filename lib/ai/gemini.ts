import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return apiKey;
}

function getClient() {
  return new GoogleGenAI({ apiKey: getGeminiApiKey() });
}

export async function generateGeminiText(prompt: string) {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error("Prompt is required");
  }

  const ai = getClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: cleanPrompt,
  });

  return response.text?.trim() ?? "";
}

export async function generateGeminiJson<T>(prompt: string): Promise<T> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error("Prompt is required");
  }

  const ai = getClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: cleanPrompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const raw = response.text?.trim() ?? "";
  if (!raw) {
    throw new Error("Gemini returned an empty response");
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1)) as T;
    }
    throw new Error("Gemini response was not valid JSON");
  }
}
