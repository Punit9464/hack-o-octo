import twilio from "twilio";

const postController = async (req, res, next) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const g = twiml.gather({
        input: "speech", language: "hi-IN", speechTimeout: "auto",
        action: "/process_speech", method: "POST"
    });
    g.say({ language: "hi-IN", voice: "Polly.Aditi" },
        "Namaste! Kripya apni sehat ki samasya batayein.");
    twiml.redirect("/voice");
    res.type("text/xml").send(twiml.toString());
}
const controllers = { postController };
export default controllers;