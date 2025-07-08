import { GoogleGenAI } from "@google/genai";
import { CATEGORIES } from '../constants';
import type { StoryCategory } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "disabled" });

export const generateStory = async (prompt: string): Promise<{ title: string; content: string; category: StoryCategory } | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key for Gemini is not configured.");
  }
  
  const systemInstruction = `أنت روائي محترف متخصص في كتابة القصص الطويلة والمثيرة التي تبقي القارئ على حافة مقعده. مهمتك هي توليد قصة واقعية ومفصلة ومليئة بالتشويق.
يجب أن تكون الاستجابة بصيغة JSON تحتوي على الحقول التالية بالضبط:
- "title": (string) عنوان جذاب وغامض للقصة.
- "content": (string) محتوى القصة الكامل، يجب أن يكون مفصلاً وغنياً بالأحداث، ولا يقل عن 500 كلمة. يجب أن تحتوي القصة على حبكة متصاعدة وذروة مثيرة ونهاية مرضية.
- "category": (string) واحدة من هذه التصنيفات بالضبط: ${CATEGORIES.join(', ')}.
لا تضف أي نص خارج كائن JSON.`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: `قم بإنشاء قصة بناءً على الفكرة التالية: "${prompt}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.8,
        },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (parsedData.title && parsedData.content && parsedData.category && CATEGORIES.includes(parsedData.category)) {
      return {
        title: parsedData.title,
        content: parsedData.content,
        category: parsedData.category,
      };
    } else {
      console.error("Generated data from AI is missing required fields or has an invalid category.", parsedData);
      throw new Error("البيانات المولّدة من الذكاء الاصطناعي غير مكتملة.");
    }
  } catch (error) {
    console.error("Error generating story with Gemini:", error);
    throw new Error("حدث خطأ أثناء توليد القصة. يرجى المحاولة مرة أخرى.");
  }
};
