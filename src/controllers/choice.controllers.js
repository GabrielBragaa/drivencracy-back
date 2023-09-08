import { db } from '../database/database.js';
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';
import { choiceSchema } from '../schemas/choice.schemas.js';

export async function sendChoice (req, res) {
    const {title, pollId} = req.body;
    const choice = {title, pollId};
    const validation = choiceSchema.validate(req.body, {abortEarly: false});

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        res.status(422).send(errors);
    }


    if (!title) {
        return res.status(422).send("Preencha o título!");
    }

    if (!pollId) {
        return res.status(422).send("Preencha o ID da enquete!")
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

}

export async function getChoices (req, res) {
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
}

export async function voteChoice (req, res) {
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
}