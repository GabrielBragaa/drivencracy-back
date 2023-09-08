import dayjs from "dayjs";
import joi from 'joi';
import { db } from "../app.js";
import { ObjectId } from "mongodb";

export async function sendPoll (req, res) {
    let {title, expireAt} = req.body;
    const day = dayjs().day();
    const pollSchema = joi.object({
        title: joi.string().min(3).required(),
        expireAt: joi.date()
    })

    const validation = pollSchema.validate(req.body, {abortEarly: false});

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    if (!title) {
        return res.status(422).send("Preencha o título!")
    }

    if (!expireAt) {
        expireAt = dayjs().set('day', day + 30).format('YYYY-MM-DD HH:mm')
    }

    try {
        const poll = {title, expireAt};

        await db.collection("polls").insertOne(poll);

        res.status(201).send(poll);
    } catch (err) {
        res.status(500).send(err.message);
    }

}

export async function getPoll (req, res) {
    try {
        const polls = await db.collection("polls").find().toArray();
        res.send(polls);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function pollResult (req, res) {
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
}