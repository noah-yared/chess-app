import type { Difficulty, Move, MoveList, Square } from "../../shared/types/chess";
import type { Client } from "./client";

export class EngineAPI {
  constructor(private readonly client: Client) {}
  
  private static readonly depthMap: Record<Difficulty, number> = {
    'beginner': 1,
    'novice': 2,
    'intermediate': 3,
    'advanced': 5,
    'expert': 6,
    'master': 7
  };

  public async updateFen(fen: string, move: Move): Promise<string> {
    const { newFen } = await this.client.post<{ newFen: string }>('/update-fen', { fen, move });
    return newFen;
  }

  public async getEngineResponse(currentFen: string, difficulty: Difficulty): Promise<{response: Move, newFen: string, legalMoves: MoveList}> {
    const { response, newFen, legalMoves } = await this.client.post<{
      response: Move,
      newFen: string,
      legalMoves: { [key: string]: Array<{to: Square, promoting: boolean}> }
    }>('/engine-move', { fen: currentFen, depth: EngineAPI.depthMap[difficulty] }); 
    return { response, newFen, legalMoves: new Map(Object.entries(legalMoves)) as MoveList };
  }

  public async getLegalMoves(fen: string): Promise<MoveList> {
    const { legalMoves } = await this.client.post<{
      legalMoves: { [key: string]: Array<{to: Square, promoting: boolean}> }
    }>('/legal-moves', { fen });
    return new Map(Object.entries(legalMoves)) as MoveList;
  }

  public async isKingInCheck(fen: string): Promise<boolean> {
    const { isKingInCheck } = await this.client.post<{ isKingInCheck: boolean }>('/king-in-check', { fen });
    return isKingInCheck;
  }
}
