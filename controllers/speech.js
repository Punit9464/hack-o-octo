import twilio from 'twilio';
const VOICE = "Polly.Aditi";
const LOCALE = "hi-IN";
import getAiAdvice from '../utils/getAdvice.js';

async function postController (req, res) {
    const text = req.body.SpeechResult || "";
    const conf = Number(req.body.Confidence || 0);
    const twiml = new twilio.twiml.VoiceResponse();

    if (!text || conf < 0.35) {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/process_speech", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE }, "Maaf kijiye, kripya tezz aur saaf boliye.");
        return res.type("text/xml").send(twiml.toString());
    }

    const lower = text.toLowerCase();
    const wantsAppointment = [
        "appointment", "token", "doctor", "check up", "checkup",
        "hospital", "aspatal", "milna", "dikhaana", "opd", "नियुक्ति", "अपॉइंटमेंट", "emergency"
    ].some(word => lower.includes(word));

    if (wantsAppointment) {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/ask_location", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE },
            "Aap kis shehar ya gaon se bol rahe hain? Kripya apne shehar ka naam boliye.");
        return res.type("text/xml").send(twiml.toString());
    }

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
}

const controllers = { postController };
export default controllers;