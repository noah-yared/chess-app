import * as fs from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import type { Move, MoveList, Promotion, Square } from '../shared/types/chess';

class Deferred<T> {
  public readonly promise: Promise<T>;
  public resolve!: (value: T) => void;
  public reject!: (reason?: unknown) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export class Engine {
  private static readonly engineBinaryPath: string = Engine.getEngineBinaryPath();
  private readonly engineProcess: ChildProcessWithoutNullStreams;
  
  // store output for later command that is to be processed
  private pendingOutput: string = "";

  private readonly outputQueue: Array<Deferred<string>> = [];

  constructor() {
    this.engineProcess = spawn(Engine.engineBinaryPath, ['--app-mode']);
    this.engineProcess.stdout.setEncoding('utf-8');
    this.engineProcess.stderr.setEncoding('utf-8');
    this.engineProcess.stdout.on('data', (data: string) => {
      const emptyLine = "\n\n";

      let fullOutput = this.pendingOutput + data;
      let outputEnd = fullOutput.indexOf(emptyLine);

      while (outputEnd !== -1) {
        const invokationOutput = fullOutput.substring(0, outputEnd + emptyLine.length);
        this.outputQueue.shift()!.resolve(invokationOutput);
        fullOutput = fullOutput.substring(outputEnd + emptyLine.length);
        outputEnd = fullOutput.indexOf(emptyLine);
      }

      // store remaining output for later processing
      this.pendingOutput = fullOutput;

      console.log('remaining output queue size:', this.outputQueue.length);
    });
    this.engineProcess.stderr.on('data', (data: string) => {
      console.log('got a chunk of stderr data:\n' + data);
    });
    this.engineProcess.on('close', (exitCode: number) => {
      console.log('engine process closed with exit code', exitCode);
    });
  }

  private static getEngineBinaryPath(): string {
    const engineConfigPath: string = join(cwd(), 'engine', 'engine_config.json');
    const contents: string = fs.readFileSync(engineConfigPath, { encoding: "utf-8" });
    const config = JSON.parse(contents);
    return config.enginePath!; // should not be undefined
  }

  private async invokeEngine(input: string, expectOutput: boolean = true): Promise<string> {
    const writeResult = this.engineProcess.stdin.write(input.trim() + '\n');

    const drainProcessBuffer = (() => new Promise<void>((resolve, reject) => {
      try {
        this.engineProcess.on('drain', resolve);
      } catch {
        reject('failed to drain buffer');
      }
    }));

    if (!writeResult) {
      await drainProcessBuffer();
      return await this.invokeEngine(input);
    } else {
      console.log('successfully wrote', input.trim(), 'to engine process stdin');
    }

    if (!expectOutput) {
      return '';
    }

    const output = new Deferred<string>();
    this.outputQueue.push(output);

    return await output.promise;
  }

  public async setPosition(fen: string): Promise<void> {
    await this.invokeEngine(`set-position,${fen}`, false);
  }

  public async computeLegalMoves(fen?: string): Promise<MoveList> {
    const result = await this.invokeEngine(`legal-moves${fen ? `,${fen}` : ''}`);
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

  public async computeEngineMove(depth: number, easyMode: boolean): Promise<Move> {
    console.log(`computing engine move with depth ${depth} and easy mode ${easyMode}`);
    const result = await this.invokeEngine(`find-best,${depth},${easyMode ? 'true' : 'false'}`);
    const match = result.match(/(?<from>[a-h][1-8])(?<to>[a-h][1-8])(?<promo>[nrbq]?)/);
    const { from, to, promo } = match!.groups!;
    if (promo.length === 0)
      return { from: from as Square, to: to as Square } as const;
    return { from: from as Square, to: to as Square, promo: promo as Promotion } as const;
  }

  public async computeKingInCheck(fen?: string): Promise<boolean> {
    const result = await this.invokeEngine(`king-in-check${fen ? `,${fen}` : ''}`);
    const match = result.match(/(true|false)/);
    return match![0] === 'true';
  }

  public async computeUpdatedFen(move: Move, fen?: string): Promise<string> {
    const uciNotation: string = `${move.from}${move.to}${move.promo ? move.promo : ''}`;
    return (await this.invokeEngine(`make-move,${uciNotation}${fen ? `,${fen}` : ''}`)).trim();
  }

  public async computeCurrentFen(): Promise<string> {
    return (await this.invokeEngine("current-fen")).trim();
  }

}
