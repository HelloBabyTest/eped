import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ''
});

export const searchNotesWithAI = async (query: string, notes: any[]) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const notesContext = notes.map(n => ({
    id: n.id,
    title: n.title,
    content: n.content
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Siz professional asistentsiz. Foydalanuvchiga uning shaxsiy qaydlari orasidan keraklisini topishga yordam berasiz.
    
    Qaydlar ro'yxati (JSON):
    ${JSON.stringify(notesContext)}
    
    Foydalanuvchi so'rovi: "${query}"
    
    Ushbu so'rovga eng yaqin va mazmuni bo'yicha mos keladigan qaydlarning faqat ID raqamlarini qaytaring. 
    So'rovda yashirin ma'no yoki sinonimlar bo'lsa ham hisobga oling.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          relevant_ids: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          explanation: {
            type: Type.STRING,
            description: "Nima uchun bu qaydlar tanlanganligi haqida qisqacha izoh (o'zbek tilida)"
          }
        },
        required: ["relevant_ids"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return {
      ids: result.relevant_ids || [],
      explanation: result.explanation || ''
    };
  } catch (e) {
    console.error("AI parsing error:", e);
    return { ids: [], explanation: '' };
  }
};
