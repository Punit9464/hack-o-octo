import twilio from 'twilio';

const postController = async (req, res) => {
    const a = (req.body.SpeechResult || "").toLowerCase();
    const twiml = new twilio.twiml.VoiceResponse();
    if (a.includes("na") || a.includes("nahin") || a.includes("no")) {
        twiml.say({ language: LOCALE, voice: VOICE }, "Dhanyavaad! Swasth rahiye. Namaste.");
        twiml.hangup();
    } else {
        twiml.redirect("/process_speech");
    }
    res.type("text/xml").send(twiml.toString());
}

const controllers = { postController };
export default controllers;