import express from 'express';
import controllers from '../controllers/location.js';
import errorHandler from '../utils/errorHandler.js';

const locationRouter = express.Router();

locationRouter.route('/')
    .post(errorHandler(controllers.postController));

export default locationRouter;