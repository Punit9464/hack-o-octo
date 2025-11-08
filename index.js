import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const LOCALE = "hi-IN";
const VOICE = "Polly.Aditi";

const { GEMINI_KEY } = process.env;
const geminiClient = new GoogleGenAI({ apiKey: GEMINI_KEY });

async function getAiAdvice(text, locale = "hi-IN") {
const prompt = `
You are a helpful health assistant for rural Indian callers.
Your goal is to provide **practical, useful, and immediately applicable guidance.**

Rules:
- Reply in **very simple ${locale==="hi-IN"?"Hindi":"English"}**.
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

app.post("/voice", (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const g = twiml.gather({
        input: "speech", language: LOCALE, speechTimeout: "auto",
        action: "/process_speech", method: "POST"
    });
    g.say({ language: LOCALE, voice: VOICE },
        "Namaste! Kripya apni sehat ki samasya batayein.");
    twiml.redirect("/voice");
    res.type("text/xml").send(twiml.toString());
});


app.post("/process_speech", async (req, res) => {
    console.log(req.body);
    const text = req.body.SpeechResult || "";
    console.log(text);
    const conf = Number(req.body.Confidence || 0);
    const twiml = new twilio.twiml.VoiceResponse();

    if (!text || conf < 0.35) {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/process_speech", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE }, "Maaf kijiye, kripya dheere aur saaf boliye.");
        return res.type("text/xml").send(twiml.toString());
    }

    let advice;
    try {
        advice = await getAiAdvice(text, LOCALE);
    } catch (err) {
        console.error("🔥 AI Error:", err);
        advice = "Filhaal AI se salaah uplabdh nahi hai.";
    }


    twiml.say({ language: LOCALE, voice: VOICE }, advice);

    const g2 = twiml.gather({
        input: "speech", language: LOCALE, speechTimeout: "auto",
        action: "/followup", method: "POST"
    });
    g2.say({ language: LOCALE, voice: VOICE }, "Kya aapko aur madad chahiye? Haan ya Na kahiye.");
    res.type("text/xml").send(twiml.toString());
});

app.post("/followup", (req, res) => {
    const a = (req.body.SpeechResult || "").toLowerCase();
    const twiml = new twilio.twiml.VoiceResponse();
    if (a.includes("na") || a.includes("nahin") || a.includes("no")) {
        twiml.say({ language: LOCALE, voice: VOICE }, "Dhanyavaad! Swasth rahiye. Namaste.");
        twiml.hangup();
    } else {
        twiml.redirect("/voice");
    }
    res.type("text/xml").send(twiml.toString());
});

app.get("/", (_, r) => r.send("OK"));
app.listen(process.env.PORT || 3000, () => console.log("voice server up"));
