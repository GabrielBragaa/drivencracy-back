import { Router } from "express";
import { getPoll, pollResult, sendPoll } from "../controllers/poll.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.middlewares.js";
import { pollSchema } from "../schemas/poll.schemas.js";

const pollRouter = Router();

pollRouter.post("/poll", validateSchema(pollSchema), sendPoll);
pollRouter.get("/poll", getPoll);
pollRouter.get("/poll/:id/result", pollResult);

export default pollRouter;