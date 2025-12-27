import type { Difficulty, Move, MoveList, Square } from "../../shared/types/chess";
import type { Client } from "./client";

export class EngineAPI {
  constructor(private readonly client: Client) {}
  
  private static readonly depthMap: Record<Difficulty, number> = {
    'beginner': 1,
    'novice': 2,
    'intermediate': 4,
    'advanced': 7,
    'expert': 7,
    'master': 8
  };

  private static readonly difficultyLevelMap: Record<Difficulty, number> = {
    'beginner': 0,
    'novice': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4,
    'master': 5
  };

  public async reset(): Promise<void> {
    await this.client.post<void>('/reset');
  }

  public async didClientTimeOut(): Promise<boolean> {
    const { timedOut } = await this.client.post<{ timedOut: boolean }>('/timed-out');
    return timedOut;
  }

  public async heartbeat(): Promise<void> {
    const { received } = await this.client.post<{ received: boolean }>('/heartbeat');
    if (!received)
      throw new Error('Client heartbeat failed!');
  }

  public async updateFen(move: Move, fen?: string): Promise<string> {
    const { newFen } = await this.client.post<{ newFen: string }>('/update-fen', { fen, move });
    return newFen;
  }

  public async getEngineResponse(difficulty: Difficulty, fen?: string): Promise<{response: Move, newFen: string, legalMoves: MoveList}> {
    const { response, newFen, legalMoves } = await this.client.post<{
      response: Move,
      newFen: string,
      legalMoves: { [key: string]: Array<{to: Square, promoting: boolean}> }
    }>('/engine-move', {
      fen,
      depth: EngineAPI.depthMap[difficulty],
      difficultyLevel: EngineAPI.difficultyLevelMap[difficulty]
    }); 
    return { response, newFen, legalMoves: new Map(Object.entries(legalMoves)) as MoveList };
  }

  public async getLegalMoves(fen?: string): Promise<MoveList> {
    const { legalMoves } = await this.client.post<{
      legalMoves: { [key: string]: Array<{to: Square, promoting: boolean}> }
    }>('/legal-moves', { fen });
    return new Map(Object.entries(legalMoves)) as MoveList;
  }

  public async isKingInCheck(fen?: string): Promise<boolean> {
    const { isKingInCheck } = await this.client.post<{ isKingInCheck: boolean }>('/king-in-check', { fen });
    return isKingInCheck;
  }
}
