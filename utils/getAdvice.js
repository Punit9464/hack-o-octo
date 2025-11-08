import { GoogleGenAI } from '@google/genai';
import getSession from '../store/getSession.js';

async function getAiAdvice(mobile, text, locale = "hi-IN") {
    console.log(text);

    const prevSession = getSession(mobile);
    console.log(prevSession);

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
    const prompt = `
You are a helpful health assistant for rural Indian callers.
Your goal is to provide **practical, useful, and immediately applicable guidance.**

Rules:
- Don't ask too much questions and answer in a single go as per the problem of the user
- Just make it sure you are crisp
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
- If you feel the medical symptoms are severe adhere the user to concern with a doctor.

Caller said: "${text} ${(prevSession && prevSession.length) ? ` and the previous information context: ${prevSession.join(" ")}. This is the context only, so take this into consideration and focus what you need to say to the problem. Dont be repititive and be crisp.` : ""}"


Answer by maintaining the single session among the above statements so that user may feels like he is using a single session only.

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