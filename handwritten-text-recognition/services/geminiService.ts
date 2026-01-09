
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const recognizeHandwriting = async (base64Image: string): Promise<{ text: string; confidence: number }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Strip metadata if present
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
          {
            text: "Identify all handwritten text in this image. If it is a digit, return the digit. If it is a word or sentence, return the exact text. Also provide a confidence score between 0 and 100 based on how clear the text is. Return the response in JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The extracted handwritten text.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score from 0 to 100.",
            },
          },
          required: ["text", "confidence"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      text: result.text || "No text detected",
      confidence: result.confidence || 0,
    };
  } catch (error) {
    console.error("Gemini Recognition Error:", error);
    throw new Error("Failed to recognize text. Please try a clearer image.");
  }
};
