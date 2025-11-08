import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";
import { GoogleGenAI } from "@google/genai";
import userModel from "./models/userModel.js";
import stream from 'stream';
import fs from 'fs';

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const LOCALE = "hi-IN";
const VOICE = "Polly.Aditi";

const { GEMINI_KEY } = process.env;
const geminiClient = new GoogleGenAI({ apiKey: GEMINI_KEY });

async function registerUser(userInfo) {
    const { mobile } = userInfo;
    if (!mobile) {
        return "Kripya apna number btaye.";
    }

    const user = await userModel.findOne({ mobile });
    if (user) return "Yeh user already registered hai";

    try {
        await userModel.create(userInfo);
        return "User Registeration pura ho chuka hai";
    } catch (e) {
        return "Aapke kuch anko mei glti thi, kripya firse register krey";
    }
}

async function getAiAdvice(text, locale = "hi-IN") {
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

async function bookToken(hospitalName) {
    const today = new Date().toISOString().split("T")[0];
    if (!tokens[hospitalName] || tokens[hospitalName].date != today) {
        tokens[hospitalName] = { date: today, number: 1 };
    } else {
        tokens[hospitalName].number++;
    }
    const token = tokens[hospitalName].number;
    let timeSlot = token <= 20 ? "9 se 10 baje"
        : token <= 40 ? "10 se 11 baje"
            : "11 se 12 baje";

    return { token, timeSlot };
}

function getHospitalsByLocation(location) {
    location = location.toLowerCase();
    return hospitals.filter(h =>
        (h.city && h.city.toLowerCase().includes(location)) ||
        (h.district && h.district.toLowerCase().includes(location)) ||
        (h.state && h.state.toLowerCase().includes(location))
    );
}

function pickNearestHospital(location) {
    const matched = getHospitalsByLocation(location);
    if (matched.length === 0) return null;
    return matched[0]; // pick first for demo (closest / main hospital)
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
    const text = req.body.SpeechResult || "";
    const conf = Number(req.body.Confidence || 0);
    const twiml = new twilio.twiml.VoiceResponse();

    console.log(text);

    if (!text || conf < 0.35) {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/process_speech", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE }, "Maaf kijiye, kripya dheere aur saaf boliye.");
        return res.type("text/xml").send(twiml.toString());
    }

    //for appiontment
    const lower = text.toLowerCase();
    const wantsAppointment = [
        "appointment", "token", "doctor", "check up", "checkup",
        "hospital", "aspatal", "milna", "dikhaana", "opd", "नियुक्ति", ""
    ].some(word => lower.includes(word));

    if (wantsAppointment) {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/ask_hospital", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE },
            "Kaunsi aspatal me appointment chahiye? Kripya aspatal ka naam boliye.");
        return res.type("text/xml").send(twiml.toString());
    }

    //for no appintment 
    let advice;
    try { advice = await getAiAdvice(text, LOCALE); }
    catch { advice = "Filhaal salaah dena sambhav nahi. Kripya kuch der baad koshish karein."; }

    twiml.say({ language: LOCALE, voice: VOICE }, advice);

    const g2 = twiml.gather({
        input: "speech", language: LOCALE, speechTimeout: "auto",
        action: "/followup", method: "POST"
    });
    g2.say({ language: LOCALE, voice: VOICE }, "Kya aapko aur madad chahiye? Haan ya Na kahiye.");

    res.type("text/xml").send(twiml.toString());
});

app.post("/ask_hospital", (req, res) => {
    const spoken = (req.body.SpeechResult || "").toLowerCase();
    const twiml = new twilio.twiml.VoiceResponse();

    // Try matching spoken hospital name
    const match = hospitals.find(h =>
        spoken.includes(h.name.toLowerCase().split(" ")[0]) // first word match logic
    );

    if (!match) {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/ask_hospital", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE },
            "Maaf kijiye, aspatal ka naam samajh nahi aaya. Kripya fir se boliye.");
        return res.type("text/xml").send(twiml.toString());
    }

    const { token, timeSlot } = bookToken(match.name);

    twiml.say({ language: LOCALE, voice: VOICE },
        `Appointment safalta se book ho gaya hai.
     Aspatal: ${match.name}.
     Aapka token number: ${token}.
     Reporting samay: ${timeSlot}.
     Kripya samay se pahunch jaiye. Dhanyavaad!`);

    twiml.hangup();
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
