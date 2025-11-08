process.loadEnvFile('.env');
import { GoogleGenAI } from '@google/genai';

async function getAiAdvice(text, locale = "hi-IN") {
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
    const prompt = `
You are a helpful health assistant for rural Indian callers.
Your goal is to provide **practical, useful, and immediately applicable guidance.**

Rules:
- Reply in **very simple ${locale === "hi-IN" ? "Hindi" : "English"}**.
- Understand symptoms and explain them simply.
- Give **home remedies and daily care steps** first.
- You **can suggest common OTC medicines** like:
  - Paracetamol for fever/pain
  - ORS for dehydration
  - Balm for headache
  - Steam inhalation for cold/cough
- **Do not force doctor visit unless symptoms are severe.**
- Only say doctor warning if:
  - High fever > 102°F for 2+ days
  - Severe chest pain
  - Difficulty breathing
  - Unconsciousness
- No complicated medical terminology.
- No guilt or fear tone.
- Speak warm, friendly, and supportive.

Caller said: "${text}"

Respond like you are talking to a real person on the phone, in short sentences.
`;

    try {
        const res = await geminiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const textResponse = res.text.trim();
        return textResponse || "Maaf kijiye, kripya dobara kahiye.";
    } catch (err) {
        console.log("🔥 Gemini Error:", err);
        return "Filhaal AI se salaah uplabdh nahi hai. Thodi der baad fir koshish karein.";
    }
}

export default getAiAdvice;