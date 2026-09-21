import { GoogleGenAI, Type } from "@google/genai";

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export type DraftedTask = {
  title: string;
  description: string;
};

/**
 * Turns a casually-described task (typed or eventually spoken) into a
 * clean title + description, in whatever language the employee used.
 *
 * This is the seed of the "AI Guide" — every other place that needs
 * Gemini (Knowledge search, "what did I do yesterday") can follow the
 * same pattern: build a client, describe the job in the prompt, ask for
 * structured JSON back.
 */
export async function draftTaskFromText(spokenText: string): Promise<DraftedTask> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not set on the server.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You turn an employee's casual task description into a clean task record for a work-tracking tool. Reply in the same language/mix the employee used (Hindi, English, or Hinglish).

Employee said: "${spokenText}"

Write a short, clear task title (under 10 words) and a one-sentence description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(text) as DraftedTask;
}
