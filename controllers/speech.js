import twilio from 'twilio';
const VOICE = "Polly.Aditi";
const LOCALE = "hi-IN";
import getAiAdvice from '../utils/getAdvice.js';
import changeContext from '../store/changeContext.js';

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
    
    let advice;
    try { advice = await getAiAdvice(req.body.From, text, LOCALE); changeContext(req.body.From, text); }
    catch { advice = "Filhaal salaah dena sambhav nahi. Kripya kuch der baad koshish karein."; }

    twiml.say({ language: LOCALE, voice: VOICE }, advice);
    console.log(text);
    console.log(advice);
    
    if(advice.includes("गंभीर") || text.includes("अपॉइंटमेंट") || text.includes("नियुक्ति") || advice.includes("Critical") || advice.includes("नाजुक")) {
        const ctx = twiml.gather({
            input: "dtmf",
            numDigits: 1,
            method: "POST",
            action: "/options"
        });

        ctx.say({ language: LOCALE, voice: VOICE}, "Yeh samasya gambhir lag rahi hai. " +
    "Baat jaari rakhne ke liye 1 dabaiye. " +
    "Aspatal me appointment book karne ke liye 2 dabaiye. " +
    "Call band karne ke liye 3 dabaiye.");
        return res.type("text/xml").send(twiml.toString());
    }
    const g2 = twiml.gather({
        input: "speech", language: LOCALE, speechTimeout: "auto",
        action: "/followup", method: "POST"
    });
    g2.say({ language: LOCALE, voice: VOICE }, "Kya aapko aur madad chahiye?");

    res.type("text/xml").send(twiml.toString());
}

const controllers = { postController };
export default controllers; 