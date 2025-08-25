import type { File, Move, Piece, Rank, Square, GameStatus } from "../../shared/types/chess"
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

const toUpperIfWhite = (str: string, isWhite: boolean) => isWhite ? str.toUpperCase() : str.toLowerCase();

const getPieceFromSquare = (board: (Piece | null)[][], square: Square): Piece => {
  const rank: Rank = square[1] as Rank, file: File = square[0] as File;
  const rankIndex = '8'.charCodeAt(0) - rank.charCodeAt(0);
  const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);

  return board[rankIndex][fileIndex]!;
}

const existsPieceOnSquare = (board: (Piece | null)[][], square: Square): boolean => {
  const rank: Rank = square[1] as Rank, file: File = square[0] as File;
  const rankIndex = '8'.charCodeAt(0) - rank.charCodeAt(0);
  const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);
  return board[rankIndex][fileIndex] !== null;
}

export function notateMove(move: Move, board: (Piece | null)[][], gameStatus: GameStatus): string {
  const { from, to, promo } = move;
  const { isKingInCheck, isGameOver } = gameStatus;
  const fromPiece = getPieceFromSquare(board, from);
  const existsToPiece = existsPieceOnSquare(board, to);
  const pieceType = fromPiece.type === 'p' ? '' : toUpperIfWhite(fromPiece.type, fromPiece.color === 'w');
  const promotion = promo ? toUpperIfWhite(promo, fromPiece.color === 'w') : '';
  const capture = existsToPiece ? 'x' : '';
  const check = !isGameOver && isKingInCheck ? '+' : '';
  const checkmate = isGameOver && isKingInCheck ? '#' : '';
  const stalemate = isGameOver && !isKingInCheck ? '$' : '';
  return `${pieceType}${capture}${to}${promotion}${check}${checkmate}${stalemate}`;
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