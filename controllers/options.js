import twilio from 'twilio';
const LOCALE = 'hi-IN';
const VOICE = 'Polly.Aditi';

const postController = async (req, res, next) => {
    const digit = req.body.Digits;
    const twiml = new twilio.twiml.VoiceResponse();

    if (digit == "1") {
        const g = twiml.gather({
            input: "speech", language: LOCALE, speechTimeout: "auto",
            action: "/process_speech", method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE },
            "Thik hai apni baat jaari rkhein");
    } else if (digit == "2") {
        const g = twiml.gather({
            input: "dtmf",
            numDigits: 6,
            action: "/ask_location", 
            method: "POST"
        });
        g.say({ language: LOCALE, voice: VOICE },
            "Aap apne area ka pincode btaye, taaki mai aapka appointment book kr sku..");
    } else if (digit == "3") {
        twiml.say({ language: LOCALE, voice: VOICE },
            "Thik hai Bye!, Apna khayal rkhe");
        twiml.hangup();
    } else {
        twiml.say({ language: LOCALE, voice: VOICE },
            "Aapne galat vikalp choose kra hai kripa krke sahi vikalp chune");

        const ctx = twiml.gather({
            input: "dtmf",
            method: "POST",
            action: "/options",
            numDigits: 1
        });

        ctx.say({ language: LOCALE, voice: VOICE }, "Yeh samasya gambhir lag rahi hai. " +
            "Baat jaari rakhne ke liye 1 dabaiye. " +
            "Aspatal me appointment book karne ke liye 2 dabaiye. " +
            "Call band karne ke liye 3 dabaiye.");
        return res.type("text/xml").send(twiml.toString());
    }

    return res.type("text/xml").send(twiml.toString());
}

const controllers = { postController };
export default controllers;