import { Router } from "express";
import { getChoices, sendChoice, voteChoice } from "../controllers/choice.controllers.js";

const choiceRouter = Router();

choiceRouter.post("/choice", sendChoice);
choiceRouter.get("/poll/:id/choice", getChoices);
choiceRouter.post("/choice/:id/vote", voteChoice);

export default choiceRouter;