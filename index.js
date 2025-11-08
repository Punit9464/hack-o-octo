import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import voiceRouter from "./routes/voiceRouter.js";
import speechRouter from "./routes/speechRouter.js";
import locationRouter from "./routes/location.js";
import followUpRouter from "./routes/followUp.js";
import pickNearestHospital from "./utils/pickNearestHospital.js";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use("/voice", voiceRouter);
app.use("/process_speech", speechRouter);
app.use("/ask_location", locationRouter);
app.use("/followup", followUpRouter);
app.get("/", (_, r) => r.send("OK"));
app.listen(process.env.PORT || 3000,async  () => {
    console.log("voice server up");
    await pickNearestHospital('delhi');
});
