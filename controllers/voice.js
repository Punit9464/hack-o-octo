import twilio from "twilio";
import initSession from "../store/addUser.js";

const postController = async (req, res, next) => {
    initSession(req.body.From);
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