import express from 'express';
import controllers from "../controllers/options.js";
const optionRouter = express.Router();

optionRouter.route('/')
    .post(controllers.postController);

export default optionRouter;