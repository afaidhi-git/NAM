
import { GoogleGenAI } from "@google/genai";
import { Asset } from '../types';

let genAI: GoogleGenAI | null = null;

// Initialize the API client safely
try {
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI", error);
}

export const analyzeInventory = async (
  query: string, 
  inventory: Asset[]
): Promise<string> => {
  if (!genAI) {
    return "API Key is not configured. Please set the API_KEY environment variable.";
  }

  // Optimize context to save tokens, only sending necessary fields
  const inventoryContext = JSON.stringify(
    inventory.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      status: a.status,
      price: a.price,
      purchaseDate: a.purchaseDate,
      assignedTo: a.assignedTo
    }))
  );

  const systemInstruction = `
    You are Nexus, an intelligent IT Asset Management Assistant.
    You have access to the current inventory data provided below in JSON format.
    
    Your goal is to answer user questions regarding the inventory, generate insights, summary statistics, or suggestions.
    
    Rules:
    1. Base your answers STRICTLY on the provided JSON data.
    2. If the user asks for information not in the data, state that you don't have that information.
    3. Be concise and professional.
    4. You can calculate totals, averages, and count items based on criteria.
    5. Format currency in USD.
    
    Current Inventory Data:
    ${inventoryContext}
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response based on the inventory data.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request. Please check the console for details.";
  }
};

export const draftDocumentContent = async (
  prompt: string,
  currentContent: string
): Promise<string> => {
  if (!genAI) {
    return "<p>API Key missing. Cannot generate content.</p>";
  }

  const systemInstruction = `
    You are a professional document assistant. 
    Your task is to help write or improve HTML content for business documents (memos, reports, letters).
    
    Rules:
    1. Return ONLY the HTML content. Do not include markdown code blocks or explanations.
    2. Use simple inline styles if formatting is needed (e.g. style="font-weight:bold").
    3. Keep the tone professional.
    4. If the user asks to rewrite, use the provided current content context.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User Prompt: ${prompt}\n\nCurrent Document Context (if any): ${currentContent}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content.";
  }
};
