import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";
import bookToken from "./utils/bookToken.js";
import voiceRouter from "./routes/voiceRouter.js";
import speechRouter from "./routes/speechRouter.js";

const tokens = {};

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const LOCALE = "hi-IN";
const VOICE = "Polly.Aditi";

app.use("/voice", voiceRouter);

app.use("/process_speech", speechRouter);

app.post("/ask_location", async (req, res) => {
    const spokenLocation = (req.body.SpeechResult || "").toLowerCase();
    console.log(spokenLocation);
    const hospital = await pickNearestHospital(spokenLocation);

    const twiml = new twilio.twiml.VoiceResponse();

    if (!hospital) {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/ask_location", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE },
            "Maaf kijiye, is shehar ke aspatal ka record nahi mila. Kripya shehar ka naam dobara boliye.");
        return res.type("text/xml").send(twiml.toString());
    }

    const { token, timeSlot } = bookToken(hospital.name);

    twiml.say({ language: LOCALE, voice: VOICE },
        `Appointment safalta se book ho gaya hai.
     Aspatal: ${hospital.name}.
     Token Number: ${token}.
     Reporting Samay: ${timeSlot}.
     Kripya samay se pahunch jaiye.`);

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
app.listen(process.env.PORT || 3000,async  () => {
    console.log("voice server up");
});
