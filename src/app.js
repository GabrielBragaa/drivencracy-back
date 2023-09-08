import express from 'express';
import { MongoClient} from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import indexRouter from './routes/index.routes.js';


const app = express();
app.use(express.json());
app.use(cors());


dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
export let db;
 
mongoClient.connect()
.then(() => db = mongoClient.db())
.catch((err) => console.log(err.message));

app.use(indexRouter)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));