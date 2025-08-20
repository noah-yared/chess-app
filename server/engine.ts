import * as fs from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'child_process';
import type { Move, MoveList, Promotion, Square } from '../shared/types/chess';

export class Engine {
  private static readonly engineBinaryPath: string = Engine.getEngineBinaryPath();

  private static getEngineBinaryPath(): string {
    const engineConfigPath: string = join(cwd(), 'engine', 'engine_config.json');
    const contents: string = fs.readFileSync(engineConfigPath, { encoding: "utf-8" });
    const config = JSON.parse(contents);
    return config.enginePath!; // should not be undefined
  }

  private static invokeEngine(...args: string[]): string {
    const output = spawnSync(Engine.engineBinaryPath, args, { encoding: "utf-8" });

    // ensure 0 exit status
    assert(
      output.status === 0,
      "Some error occurred or execution was interrupted during invocation of engine."
    );

    return output.stdout;
  }

  public static computeLegalMoves(fen: string): MoveList {
    const result = Engine.invokeEngine("--legal-moves", fen);
    const matches = result.matchAll(/(?<from>[a-h][1-8])(?<to>[a-h][1-8])(?<promo>[nrbq]?)/g);
    const seen = new Set<string>();
    const moves: MoveList = new Map();

    for (const match of matches) {
      if (seen.has(match.at(0)!.substring(0, 4))) { // ignore the promotion index, handle all promotion types at once
        continue;
      }
      const { from, to, promo } = match.groups!;
      const promoting = promo.length !== 0;
      if (moves.has(from as Square)) {
        moves.get(from as Square)!.push({ to: to as Square, promoting });
      } else {
        moves.set(from as Square, [{ to: to as Square, promoting }]);
      }
    }
    return moves;
  }

  public static computeEngineMove(fen: string, depth: number = 5): Move {
    const result = Engine.invokeEngine("--find-best", fen , "-d", `${depth}`);
    const match = result.match(/(?<from>[a-h][1-8])(?<to>[a-h][1-8])(?<promo>[nrbq]?)/);
    const { from, to, promo } = match!.groups!;
    if (promo.length === 0)
      return { from: from as Square, to: to as Square } as const;
    return { from: from as Square, to: to as Square, promo: promo as Promotion } as const;
  }

  public static computeUpdatedFen(fen: string, move: Move): string {
    const uciNotation: string = `${move.from}${move.to}${move.promo ? move.promo : ''}`;
    return Engine.invokeEngine("--make-move", fen, uciNotation).trim();
  }

}