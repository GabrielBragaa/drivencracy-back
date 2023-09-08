import express from 'express';
import { MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import dayjs from 'dayjs';
import joi from 'joi';
import { getPoll, pollResult, sendPoll } from './controllers/poll.controllers.js';
import { getChoices, sendChoice, voteChoice } from './controllers/choice.controllers.js';

const app = express();
app.use(express.json());
app.use(cors());


dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
export let db;
 
mongoClient.connect()
.then(() => db = mongoClient.db())
.catch((err) => console.log(err.message));


app.post("/poll", sendPoll);

app.get("/poll", getPoll);

app.post("/choice", sendChoice)

app.get("/poll/:id/choice", getChoices)

app.post("/choice/:id/vote", voteChoice)

app.get("/poll/:id/result", pollResult)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));