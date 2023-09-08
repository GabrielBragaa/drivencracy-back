import express from 'express';
import cors from 'cors';
import indexRouter from './routes/index.routes.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(indexRouter);

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));