import express from 'express';
import { MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import dayjs from 'dayjs';

const app = express();
app.use(express.json());
app.use(cors());


dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
.then(() => db = mongoClient.db())
.catch((err) => console.log(err.message));


app.post("/poll", async (req, res) => {
    let {title, expireAt} = req.body;
    const day = dayjs().day();

    if (!title) {
        return res.sendStatus(422);
    }

    if (!expireAt) {
        expireAt = dayjs().set('day', day + 30).format('YYYY-MM-DD HH:mm')
    }

    try {
        const poll = {title, expireAt};

        await db.collection("polls").insertOne(poll);

        res.status(201).send(poll);
    } catch (err) {
        res.send(err.message)
    }

})

app.get("/poll", async (req, res) => {
    try {
        const polls = await db.collection("polls").find().toArray();
        res.send(polls);
    } catch (err) {
        res.send(err.message);
    }
})

app.post("/choice", async (req, res) => {
    const {title, pollId} = req.body;
    const choice = {title, pollId};

    if (!title || !pollId) {
        return res.sendStatus(422);
    }

    try {
        const poll = await db.collection("polls").findOne({_id: new ObjectId(pollId)});

        if (!poll) {
            return res.sendStatus(404);
        }

        if (dayjs().isAfter(poll.expireAt)) {
            return res.sendStatus(403);
        }

        const alreadyExists = await db.collection("choices").findOne({title: title, pollId: pollId});

        if (!alreadyExists) {
            await db.collection("choices").insertOne(choice);
        } else {
            return res.sendStatus(409);
        }

        res.sendStatus(201);

    } catch (err) {
        return res.send(err.message)
    }

})

app.get("/poll/:id/choice", async (req, res) => {
    const {id} = req.params;

    try {
        const isTherePoll = await db.collection("polls").findOne({_id: new ObjectId(id)});

        if (!isTherePoll) {
            return res.sendStatus(404);
        }

        const choices = await db.collection("choices").find({pollId: id}).toArray();
        
        res.send(choices);
    } catch (err) {
        res.send(err.message);
    }
})

app.post("/choice/:id/vote", async (req, res) => {
    const {id} = req.params;
    let votes = 0;

    try {
        const choice = await db.collection("choices").findOne({_id: new ObjectId(id)});

        if (!choice) {
            return res.sendStatus(404);
        }

        const vote = {pollId: choice.pollId, choiceId: choice._id, choiceTitle: choice.title, votes: votes + 1};

        const poll = await db.collection("polls").findOne({_id: new ObjectId(choice.pollId)});

        if (dayjs().isAfter(poll.expireAt)) {
            return res.sendStatus(403);
        }

        const isThereVote = await db.collection("votes").findOne({choiceId: new ObjectId(choice._id)});

        if (!isThereVote) {
            await db.collection("votes").insertOne(vote);
        } else {
            await db.collection("votes").updateOne({choiceId: new ObjectId(choice._id)}, {$inc: {votes: 1}});
        }

        res.sendStatus(201);

    } catch (err) { 
        res.send(err.message);
    }
})

app.get("/poll/:id/result", async (req, res) => {
    const {id} = req.params;

    if (!id) {
        return res.sendStatus(422);
    }

    try {
        const poll = await db.collection("polls").findOne({_id: new ObjectId(id)});

        if (!poll) {
            return res.sendStatus(404);
        }

        const mostVoted = await db.collection("votes").find({pollId: id}).sort({votes: -1}).limit(1).toArray();

        poll.result = {title: mostVoted[0].choiceTitle, votes: mostVoted[0].votes};

        res.send(poll);

    } catch (err) {
        res.send(res.message);
    }
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));