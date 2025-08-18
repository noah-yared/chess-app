import type { Square, Move, MoveList } from "../../shared/types/chess";
import type { Client } from "./client";

export class EngineAPI {
  constructor(private readonly client: Client) {}

  public async updateFen(fen: string, move: Move): Promise<string> {
    const { newFen } = await this.client.post<{ newFen: string }>('/update-fen', { fen, move });
    return newFen;
  }

  public async getEngineResponse(currentFen: string): Promise<{response: Move, newFen: string, legalMoves: MoveList}> {
    const { response, newFen, legalMoves } = await this.client.post<{
      response: Move,
      newFen: string,
      legalMoves: { [key: string]: Array<{to: Square, promoting: boolean}> }
    }>('/engine-move', { fen: currentFen }); 
    return { response, newFen, legalMoves: new Map(Object.entries(legalMoves)) as MoveList };
  }

  public async getLegalMoves(fen: string): Promise<MoveList> {
    const { legalMoves } = await this.client.post<{
      legalMoves: { [key: string]: Array<{to: Square, promoting: boolean}> }
    }>('/legal-moves', { fen });
    return new Map(Object.entries(legalMoves)) as MoveList;
  }
}
