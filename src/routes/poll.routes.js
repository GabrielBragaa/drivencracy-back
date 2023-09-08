import { Router } from "express";
import { getPoll, pollResult, sendPoll } from "../controllers/poll.controllers.js";

const pollRouter = Router();

pollRouter.post("/poll", sendPoll);
pollRouter.get("/poll", getPoll);
pollRouter.get("/poll/:id/result", pollResult);

export default pollRouter;