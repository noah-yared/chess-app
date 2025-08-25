import type { File, Move, Piece, Rank, Square, GameStatus, MoveList } from "../../shared/types/chess";
import { BOARD_SIZE } from "../../shared/constants/chess";

import quietMoveSound from '../assets/quiet-move.mp3';
import captureMoveSound from '../assets/capture-move.mp3';
import checkSound from '../assets/check.mp3';
import gameoverSound from '../assets/game-end.mp3';
import promotionSound from '../assets/promote.mp3';
import castleSound from '../assets/castle.mp3';

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
};

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

const isCastle = (move: Move, board: (Piece | null)[][]) => {
  return getPieceFromSquare(board, move.from).type === 'k' && Math.abs(move.from[0].charCodeAt(0) - move.to[0].charCodeAt(0)) === 2;
}

export async function playSound(move: Move, newLegalMoves: MoveList, isKingInCheck: boolean, board: (Piece | null)[][]): Promise<void> {
  const { to, promo } = move;
  if (isCastle(move, board))
    return await new Audio(castleSound).play();

  const isCapture = existsPieceOnSquare(board, to);
  const isPromotion = promo !== null;
  const isGameOver = newLegalMoves.size === 0;

  const sounds: Promise<void>[] = [];
  if (isGameOver) {
    sounds.push(new Audio(gameoverSound).play());
    if (isKingInCheck)
      sounds.push(new Audio(checkSound).play());
  } else if (isKingInCheck) {
    sounds.push(new Audio(checkSound).play());
  } else if (isPromotion) {
    sounds.push(new Audio(promotionSound).play());
  } else if (isCapture) {
    sounds.push(new Audio(captureMoveSound).play());
  } else {
    sounds.push(new Audio(quietMoveSound).play());
  }
  await Promise.all(sounds);
}

export function notateMove(move: Move, board: (Piece | null)[][], gameStatus: GameStatus): string {
  const { from, to, promo } = move;
  if (isCastle(move, board)) { // handle castle
    const fromPiece = getPieceFromSquare(board, from);
    const isShortCastle = from[0] < to[0];
    return toUpperIfWhite(isShortCastle ? "o-o" : "o-o-o", fromPiece.color === 'w');
  }
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