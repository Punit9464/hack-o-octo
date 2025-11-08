import express from 'express';
import controllers from '../controllers/speech.js';
import errorHandler from '../utils/errorHandler.js';
const speechRouter = express.Router();

speechRouter.route("/")
    .post(errorHandler(controllers.postController));

export default speechRouter;