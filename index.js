import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";
import fetch from "node-fetch";
dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const LOCALE = "hi-IN";
const VOICE = "Polly.Aditi";

async function getAiAdvice(text, locale="hi-IN") {
  const { AI_BACKEND_URL, OPENAI_API_KEY } = process.env;
  if (AI_BACKEND_URL) {
    const r = await fetch(AI_BACKEND_URL, { method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ question:text, locale }) });
    const d = await r.json(); return d.answer || "Maaf kijiye, dobara kahiye.";
  }
  if (!OPENAI_API_KEY) return "AI se jud nahi paaya. Kripya thodi der baad prayas karein.";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${OPENAI_API_KEY}`, "Content-Type":"application/json" },
    body: JSON.stringify({
      
      model:"gpt-4o-mini",
      temperature:0.2,
      messages:[{ role:"user", content:
        `Reply in ${locale==="hi-IN"?"simple Hindi":"simple English"}, short first-aid style + emergency disclaimer. User: ${text}` }]
    })
  });
  const d = await r.json(); return d.choices?.[0]?.message?.content?.trim() || "Dobara kahiye.";
}

app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const g = twiml.gather({ input:"speech", language:LOCALE, speechTimeout:"auto",
                           action:"/process_speech", method:"POST" });
  g.say({ language:LOCALE, voice:VOICE },
    "Namaste! Kripya apni sehat ki samasya batayein.");
  twiml.redirect("/voice");
  res.type("text/xml").send(twiml.toString());
});
app.post("/process_speech", async (req, res) => {
  const text = req.body.SpeechResult || "";
  const conf = Number(req.body.Confidence || 0);
  const twiml = new twilio.twiml.VoiceResponse();

  if (!text || conf < 0.35) {
    const g = twiml.gather({ input:"speech", language:LOCALE, speechTimeout:"auto",
                             action:"/process_speech", method:"POST" });
    g.say({ language:LOCALE, voice:VOICE }, "Maaf kijiye, kripya dheere aur saaf boliye.");
    return res.type("text/xml").send(twiml.toString());
  }

  let advice; try { advice = await getAiAdvice(text, LOCALE); }
  catch { advice = "Filhaal salaah dena sambhav nahi. Kripya kuch der baad koshish karein."; }

  twiml.say({ language:LOCALE, voice:VOICE }, advice);

  const g2 = twiml.gather({ input:"speech", language:LOCALE, speechTimeout:"auto",
                            action:"/followup", method:"POST" });
  g2.say({ language:LOCALE, voice:VOICE }, "Kya aapko aur madad chahiye? Haan ya Na kahiye.");
  res.type("text/xml").send(twiml.toString());
});

app.post("/followup", (req, res) => {
  const a = (req.body.SpeechResult || "").toLowerCase();
  const twiml = new twilio.twiml.VoiceResponse();
  if (a.includes("na") || a.includes("nahin") || a.includes("no")) {
    twiml.say({ language:LOCALE, voice:VOICE }, "Dhanyavaad! Swasth rahiye. Namaste.");
    twiml.hangup();
  } else {
    twiml.redirect("/voice");
  }
  res.type("text/xml").send(twiml.toString());
});

app.get("/", (_, r) => r.send("OK"));
app.listen(process.env.PORT||3000, () => console.log("voice server up"));
