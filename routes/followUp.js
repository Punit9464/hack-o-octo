import express from 'express';
import errorHandler from '../utils/errorHandler.js';
import controllers from '../controllers/followUp.js'
const followUpRouter = express.Router();

followUpRouter.route('/')
    .post(errorHandler(controllers.postController));

export default followUpRouter;