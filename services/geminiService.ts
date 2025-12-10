import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, ProcessingResult, WritingStyle } from "../types";
import { WRITING_STYLES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a Blob to a Base64 string.
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const processAudioNote = async (
  audioBlob: Blob,
  settings: AppSettings
): Promise<ProcessingResult> => {
  try {
    const base64Audio = await blobToBase64(audioBlob);
    const style = WRITING_STYLES.find(s => s.id === settings.selectedStyleId) || WRITING_STYLES[0];

    const modelId = 'gemini-2.5-flash'; 

    const systemInstruction = `
      You are an expert editor and transcriber.
      1. Transcribe the user's audio accurately.
      2. Rewrite the transcript based on the following style: "${style.name}" - ${style.systemPrompt}.
      3. Rewrite Level: ${settings.rewriteLevel}. (Low = minimal changes, High = significant restructuring).
      4. Language: Output in ${settings.language}.
      5. Generate a concise, interesting title (Serif style).
      6. Generate 2-3 relevant tags.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Audio,
            },
          },
          {
            text: "Listen to this audio, transcribe it, and then rewrite it according to the system instructions.",
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            originalTranscript: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "content", "tags", "originalTranscript"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    return JSON.parse(resultText) as ProcessingResult;

  } catch (error) {
    console.error("Error processing audio:", error);
    throw error;
  }
};
