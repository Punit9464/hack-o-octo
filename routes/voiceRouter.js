import express from 'express';
import controllers from '../controllers/voice.js';
import errorHandler from '../utils/errorHandler.js';

const voiceRouter = express.Router();

voiceRouter.route("/")
    .post(errorHandler(controllers.postController));

export default voiceRouter;