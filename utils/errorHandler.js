import twilio from 'twilio';
function errorHandler(fn) {
    const twiml = new twilio.twiml.VoiceResponse();

    return async function(req, res, next) {
        try{
            await fn(req, res, next);
        } catch(e) {
            console.log(e);

            twiml.say({ language: "hi-IN", voice: "Polly.Aditi" }, "Kuch Samsya aagyi thi Kripa, krke fir se call start krey!")
        } finally {
            // Only send if a response hasn't already been sent by the handler
            if (!res.headersSent) {
                return res.type("text/xml").send(twiml.toString());
            }
        }
    }
}

export default errorHandler;