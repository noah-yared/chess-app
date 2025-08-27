import type { File, Move, Piece, Rank, Square, GameStatus, MoveList, Color, Difficulty } from "../../shared/types/chess";
import { BOARD_SIZE, STARTING_BOARD, STARTING_FEN, INITIAL_VALID_MOVES } from "../../shared/constants/chess";
import { EngineAPI } from "./engineApi"
import { Client } from "./client";

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
  } else if (isCastle(move, board)) {
    sounds.push(new Audio(castleSound).play());
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
  const file = fromPiece.type === 'p' && existsToPiece ? from[0] : '';
  const promotion = promo ? toUpperIfWhite(promo, fromPiece.color === 'w') : '';
  const capture = existsToPiece ? 'x' : '';
  const check = !isGameOver && isKingInCheck ? '+' : '';
  const checkmate = isGameOver && isKingInCheck ? '#' : '';
  const stalemate = isGameOver && !isKingInCheck ? '$' : '';
  return `${pieceType}${file}${capture}${to}${promotion}${check}${checkmate}${stalemate}`;
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

export function sendHeartbeat() {
  new EngineAPI(new Client()).heartbeat();
}

export async function hasClientTimedOut() {
  return await new EngineAPI(new Client()).didClientTimeOut();
}

export function restoreGame(
  setBoard: (board: (Piece | null)[][]) => void,
  setFen: (fen: string) => void,
  setTurn: (turn: Color) => void,
  setFirstSelectedTile: (firstSelectedTile: Square | null) => void,
  setSecondSelectedTile: (secondSelectedTile: Square | null) => void,
  setHighlightedTiles: (highlightedTiles: {from: Square, to: Square} | null) => void,
  setHandlingMove: (handlingMove: boolean) => void,
  setIsCurrentKingInCheck: (isCurrentKingInCheck: boolean) => void,
  setEngineSide: (engineSide: Color) => void,
  setDifficulty: (difficulty: Difficulty) => void,
  setIsGameStarted: (isGameStarted: boolean) => void,
  setIsGameOver: (isGameOver: boolean) => void,
  setMoveHistory: (moveHistory: Move[]) => void,
  setFenHistory: (fenHistory: string[]) => void,
  setViewingOldHalfmove: (viewingOldHalfmove: boolean) => void,
  setHalfmoveViewIndex: (halfmoveViewIndex: number) => void,
  validPlayerMoves: React.RefObject<MoveList>
) {
  const game = localStorage.getItem('game');

  if (!game)
    return;

  const gameData = JSON.parse(game);

  setBoard(gameData.board);
  setFen(gameData.fen);
  setTurn(gameData.turn);
  setFirstSelectedTile(null);
  setSecondSelectedTile(null);
  setHighlightedTiles(gameData.highlightedTiles);
  setHandlingMove(false);
  setIsCurrentKingInCheck(gameData.isCurrentKingInCheck);
  setEngineSide(gameData.engineSide);
  setDifficulty(gameData.difficulty);
  setIsGameStarted(gameData.isGameStarted);
  setIsGameOver(gameData.isGameOver);
  setMoveHistory(gameData.moveHistory);
  setFenHistory(gameData.fenHistory);
  setViewingOldHalfmove(gameData.viewingOldHalfmove);
  setHalfmoveViewIndex(gameData.halfmoveViewIndex);
  validPlayerMoves.current = new Map(Object.entries(gameData.validPlayerMoves) as [Square, Array<{to: Square, promoting: boolean}>][]);
}

export function saveGame(
  board: (Piece | null)[][],
  fen: string,
  turn: Color,
  firstSelectedTile: Square | null,
  secondSelectedTile: Square | null,
  highlightedTiles: {from: Square, to: Square} | null,
  handlingMove: boolean,
  isCurrentKingInCheck: boolean,
  engineSide: Color,
  difficulty: Difficulty,
  isGameStarted: boolean,
  isGameOver: boolean,
  moveHistory: Move[],
  fenHistory: string[],
  viewingOldHalfmove: boolean,
  halfmoveViewIndex: number,
  validPlayerMoves: React.RefObject<MoveList>
) {
  localStorage.setItem('game', JSON.stringify({
    board,
    fen,
    turn,
    firstSelectedTile,
    secondSelectedTile,
    highlightedTiles,
    handlingMove,
    isCurrentKingInCheck,
    engineSide,
    difficulty,
    isGameStarted,
    isGameOver,
    moveHistory,
    fenHistory,
    viewingOldHalfmove,
    halfmoveViewIndex,
    validPlayerMoves: Object.fromEntries(validPlayerMoves.current.entries()) as Record<Square, Array<{to: Square, promoting: boolean}>>,
  }));
}

export function resetGame(
  setBoard: (board: (Piece | null)[][]) => void,
  setFen: (fen: string) => void,
  setTurn: (turn: Color) => void,
  setFirstSelectedTile: (firstSelectedTile: Square | null) => void,
  setSecondSelectedTile: (secondSelectedTile: Square | null) => void,
  setHighlightedTiles: (highlightedTiles: {from: Square, to: Square} | null) => void,
  setHandlingMove: (handlingMove: boolean) => void,
  setIsCurrentKingInCheck: (isCurrentKingInCheck: boolean) => void,
  setEngineSide: (engineSide: Color) => void,
  setDifficulty: (difficulty: Difficulty) => void,
  setIsGameStarted: (isGameStarted: boolean) => void,
  setIsGameOver: (isGameOver: boolean) => void,
  setMoveHistory: (moveHistory: Move[]) => void,
  setFenHistory: (fenHistory: string[]) => void,
  setViewingOldHalfmove: (viewingOldHalfmove: boolean) => void,
  setHalfmoveViewIndex: (halfmoveViewIndex: number) => void,
  validPlayerMoves: React.RefObject<MoveList>
) {
  setBoard(STARTING_BOARD);
  setFen(STARTING_FEN);
  setTurn('w');
  setFirstSelectedTile(null);
  setSecondSelectedTile(null);
  setHighlightedTiles(null);
  setHandlingMove(false);
  setIsCurrentKingInCheck(false);
  setEngineSide('b');
  setDifficulty('intermediate');
  setIsGameStarted(false);
  setIsGameOver(false);
  setMoveHistory([]);
  setFenHistory([STARTING_FEN]);
  setViewingOldHalfmove(false);
  setHalfmoveViewIndex(-1);
  validPlayerMoves.current = INITIAL_VALID_MOVES;
  new EngineAPI(new Client()).reset();  

  // clear local storage, resetting game state
  localStorage.clear();
}
