const postController = async (req, res) => {
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
}

const controllers = { postController };
export default controllers;