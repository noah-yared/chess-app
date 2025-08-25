import type { File, MoveList, Piece, Rank } from "../types/chess";

// Starting fen
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Starting board configuration
export const STARTING_BOARD: (Piece | null)[][] = [
  // Rank 8 (Black pieces)
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  // Rank 7 (Black pawns)
  Array(8).fill({ type: 'p', color: 'b' }),
  // Ranks 6-3 (empty)
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  // Rank 2 (White pawns)
  Array(8).fill({ type: 'p', color: 'w' }),
  // Rank 1 (White pieces)
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

// Board dimensions
export const BOARD_SIZE = 8;

// File labels (columns)
export const FILES: Array<File> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Rank labels (rows)
export const RANKS: Array<Rank> = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Square colors for alternating pattern
export const SQUARE_COLORS = {
  LIGHT: '#f0d9b5',
  DARK: '#b58863',
} as const; 

// Valid moves for each side at the start of the game (notice that regardless of whites first move, black has the same set of valid moves)
export const INITIAL_VALID_MOVES: MoveList = new Map([
  // white pawn moves
  ['a2', [{to: 'a3', promoting: false}, {to: 'a4', promoting: false}]],
  ['b2', [{to: 'b3', promoting: false}, {to: 'b4', promoting: false}]],
  ['c2', [{to: 'c3', promoting: false}, {to: 'c4', promoting: false}]],
  ['d2', [{to: 'd3', promoting: false}, {to: 'd4', promoting: false}]],
  ['e2', [{to: 'e3', promoting: false}, {to: 'e4', promoting: false}]],
  ['f2', [{to: 'f3', promoting: false}, {to: 'f4', promoting: false}]],
  ['g2', [{to: 'g3', promoting: false}, {to: 'g4', promoting: false}]],
  ['h2', [{to: 'h3', promoting: false}, {to: 'h4', promoting: false}]],

  // white knight moves
  ['b1', [{to: 'a3', promoting: false}, {to: 'c3', promoting: false}]],
  ['g1', [{to: 'f3', promoting: false}, {to: 'h3', promoting: false}]],

  // black pawn moves
  ['a7', [{to: 'a6', promoting: false}, {to: 'a5', promoting: false}]],
  ['b7', [{to: 'b6', promoting: false}, {to: 'b5', promoting: false}]],
  ['c7', [{to: 'c6', promoting: false}, {to: 'c5', promoting: false}]],
  ['d7', [{to: 'd6', promoting: false}, {to: 'd5', promoting: false}]],
  ['e7', [{to: 'e6', promoting: false}, {to: 'e5', promoting: false}]],
  ['f7', [{to: 'f6', promoting: false}, {to: 'f5', promoting: false}]],
  ['g7', [{to: 'g6', promoting: false}, {to: 'g5', promoting: false}]],
  ['h7', [{to: 'h6', promoting: false}, {to: 'h5', promoting: false}]],

  // black knight moves
  ['b8', [{to: 'a6', promoting: false}, {to: 'c6', promoting: false}]],
  ['g8', [{to: 'f6', promoting: false}, {to: 'h6', promoting: false}]],
]);
