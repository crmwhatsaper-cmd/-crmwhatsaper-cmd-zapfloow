
import { GoogleGenAI } from "@google/genai";

// Safe access to process.env to avoid "process is not defined" in browser environments
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

export const generateCustomerReply = async (
  history: { role: string; text: string }[],
  customerName: string
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Return a generic message if IA is not configured, instead of a system error
    // Avoid console.warn to keep logs clean in production unless debugging
    return "O assistente virtual está temporariamente indisponível (API Key não configurada).";
  }

  try {
    // Initialize inside the function to prevent app crash on load if key is missing/invalid
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Você é ${customerName}, um cliente conversando no WhatsApp com uma empresa.
    Mantenha as respostas curtas, informais e diretas, como em um chat real.
    Seja educado mas ocasionalmente impaciente se o problema não for resolvido.
    Nunca use formatação markdown complexa, use emojis moderadamente.`;
    
    const conversation = history.map(h => `${h.role === 'user' ? 'Agente' : customerName}: ${h.text}`).join('\n');
    const prompt = `${conversation}\n${customerName}:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, não entendi.";
  }
};