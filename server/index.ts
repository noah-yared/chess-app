import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { Engine } from './engine';
import { STARTING_FEN, HEARTBEAT_TIMEOUT } from '../shared/constants/chess';

dotenv.config();

const app = express();
const port = process.env.PORT || '8000';

// automatically parse json payloads
app.use(express.json());

// allow all origins for cors (dev-only)
app.use(cors())

const engine = new Engine();

class ClientConnection {
  private lastHeartbeat: number;

  constructor() {
    this.lastHeartbeat = (new Date()).getTime();
  }

  public receiveHeartbeat(): void {
    console.log('received heartbeat!');
    this.lastHeartbeat = (new Date()).getTime();
  }

  public hasTimedOut(): boolean {
    const currentTime = (new Date()).getTime();
    const timeSinceLastHeartbeat = currentTime - this.lastHeartbeat;
    if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT) {
      console.log('Timed out! Last heartbeat was', timeSinceLastHeartbeat, 'ms ago');
    }
    return timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT;
  }
}

const connection = new ClientConnection();

app.post('/timed-out', async (_, res) => {
  console.log('checking if client has timed out...');
  res.json({ timedOut: connection.hasTimedOut() });
})

app.post('/heartbeat', async (_, res) => {
  connection.receiveHeartbeat();
  res.json({ "received": true });
})

app.post('/update-fen', async (req, res) => {
  const { fen, move } = req.body;
  console.log('computing updated fen...');
  const newFen = await engine.computeUpdatedFen(move, fen);
  res.json({ newFen });
})

app.post('/engine-move', async (req, res) => {
  const { depth, easyMode } = req.body;
  const response = await engine.computeEngineMove(depth, easyMode);
  const newFen = await engine.computeCurrentFen();
  const legalMoves = await engine.computeLegalMoves(); // cannot serialize a Map
  res.json({ response, newFen, legalMoves: Object.fromEntries(legalMoves) });
})

app.post('/legal-moves', async (req, res) => {
  const { fen } = req.body;
  const legalMoves = await engine.computeLegalMoves(fen); // cannot serialize a Map
  res.json({ legalMoves: Object.fromEntries(legalMoves) });
})

app.post('/king-in-check', async (req, res) => {
  const { fen } = req.body;
  const isKingInCheck = await engine.computeKingInCheck(fen);
  res.json({ isKingInCheck });
})

app.post('/reset', async (_, res) => {
  engine.setPosition(STARTING_FEN);
  res.end()
})

app.listen(port, () => {
  console.log(`Engine server started on port ${port}`)
})
