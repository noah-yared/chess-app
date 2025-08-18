import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { Engine } from './engine';

dotenv.config();

const app = express();
const port = process.env.PORT || '8000';

// automatically parse json payloads
app.use(express.json());

// allow all origins for cors (dev-only)
app.use(cors())

app.post('/update-fen', (req, res) => {
  const { fen, move } =  req.body;
  const newFen = Engine.computeUpdatedFen(fen, move);
  res.json({ newFen });
})

app.post('/engine-move', (req, res) => {
  const { fen } = req.body;
  const response = Engine.computeEngineMove(fen);
  const newFen = Engine.computeUpdatedFen(fen, response);
  const legalMoves = Engine.computeLegalMoves(newFen); // cannot serialize a Map
  res.json({ response, newFen, legalMoves: Object.fromEntries(legalMoves) });
})

app.post('/legal-moves', (req, res) => {
  const { fen } = req.body;
  const legalMoves = Engine.computeLegalMoves(fen); // cannot serialize a Map
  res.json({ legalMoves: Object.fromEntries(legalMoves) });
})

app.listen(port, () => {
  console.log(`Engine server started on port ${port}`)
})
