import twilio from "twilio";
const LOCALE = 'hi-In';
const VOICE = 'Polly.Aditi';

import { validate, getDetails } from 'indian-pincode-validator';
import fetchHospital from "../utils/pickNearestHospital.js";
import bookToken from "../utils/bookToken.js";

const postController = async(req, res, next) => {
    const digits = req.body.Digits;
    console.log(digits);

    const twiml = new twilio.twiml.VoiceResponse();

    const valid = validate(digits)?.valid;
    console.log(valid);
    if(!valid) {
        const g = twiml.gather({
            input: "dtmf",
            numDigits: 6,
            action: "/ask_location",
            method: "POST"
        });

        g.say("Kripya krke sahi pincode de");
        return res.type("text/xml").send(twiml.toString());
    }

    const location = getDetails(digits);
    console.log(location);
    const hs = await fetchHospital(location);
    console.log(hs);
    if(!hs) {
        twiml.say({ language: LOCALE, voice: VOICE }, "Sorry mujhe koi hospital nhi mil paya hai, please apne nazdiki swasthya kendra phuche.");
        return res.type("text/xml").send(twiml.toString());
    }

    const { timeSlot, token, hospitalName } = await bookToken(hs.name);

    twiml.say({ language: LOCALE, voice: VOICE }, `Apki appointment book ho chuki hai, hospital ka naam: ${hospitalName}, samay hai: ${timeSlot}, aur apka Token hai: ${token}`);
    twiml.say({ language: LOCALE, voice: VOICE }, `Apka Dhanyawad humse judne ke liye, aap apna dhyan rkhe, aapka din shubh ho.`);
    twiml.hangup();
    return res.type("text/xml").send(twiml.toString());
}

const controllers = { postController };
export default controllers;