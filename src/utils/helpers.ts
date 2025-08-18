import type { Piece } from "../../shared/types/chess"
import { BOARD_SIZE } from "../../shared/constants/chess"

const PIECE_MAP: Record<string, Piece> = {
  'K': { type: 'k', color: 'w' },
  'Q': { type: 'q', color: 'w' },
  'R': { type: 'r', color: 'w' },
  'B': { type: 'b', color: 'w' },
  'N': { type: 'n', color: 'w' },
  'P': { type: 'p', color: 'w' },
  'k': { type: 'k', color: 'b' },
  'q': { type: 'q', color: 'b' },
  'r': { type: 'r', color: 'b' },
  'b': { type: 'b', color: 'b' },
  'n': { type: 'n', color: 'b' },
  'p': { type: 'p', color: 'b' },
}

export function fenToBoard(fen: string): (Piece | null)[][] {
  const fenPattern: RegExp = /(\w+(?=\/))|((?<=\/)\w+)/g;
  const matches = fen.match(fenPattern);

  const board: (Piece | null)[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  for (const [row, rank] of matches!.entries()) {
    let col = 0;
    for (const ch of rank) {
      if (ch.match(/[1-8]/)) {
        col += parseInt(ch);
      } else if (ch.match(/[pnbrqk]/i)) {
        board[row][col] = PIECE_MAP[ch];
        col++;
      } else {
        throw new Error(`Invalid FEN: could not parse ${ch} in board part`)
      }
    }
  }

  return board;
}