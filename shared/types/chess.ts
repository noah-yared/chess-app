export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Color = 'w' | 'b';

export type Difficulty = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'expert' | 'master';

export type Piece = {
  type: PieceType,
  color: Color
};

export type Promotion = 'n' | 'b' | 'r' | 'q';

export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type Square = `${File}${Rank}`;

export type Move = {
  from: Square,
  to: Square,
  promo?: Promotion,
}

export type GameStatus = {
  isKingInCheck: boolean,
  isGameOver: boolean,
}

export type MoveList = Map<Square, Array<{to: Square, promoting: boolean}>>;

export type HistoryProps = {
  moveHistory: Move[],
  fenHistory: string[],
  setIsKingInCheck: (kingInCheck: boolean) => void,
  setBoard: (board: (Piece | null)[][]) => void,
  setFen: (fen: string) => void,
  halfmoveViewIndex: number,
  setHalfmoveViewIndex: (halfmoveViewIndex: number) => void,
  setViewingOldHalfmove: (viewingOldHalfmove: boolean) => void,
  setIsGameOver: (isGameOver: boolean) => void,
  setTurn: (turn: Color) => void,
  setHighlightedTiles: (highlightedSquares: {from: Square, to: Square} | null) => void,
  setFirstSelectedTile: (tile: Square | null) => void,
  setSecondSelectedTile: (tile: Square | null) => void,
}

export type LoggerProps = {
  turn: Color,
  engineSide: Color,
  isCurrentKingInCheck: boolean,
  isGameOver: boolean,
  viewingOldHalfmove: boolean
};

export type MenuProps = {
  engineSide: Color,
  setEngineSide: (side: Color) => void,
  difficulty: Difficulty,
  setDifficulty: (difficulty: Difficulty) => void,
  isGameStarted: boolean,
  setIsGameStarted: (isGameStarted: boolean) => void,
}

export type ChessboardProps = {
  board: (Piece | null)[][],
  setBoard: (board: (Piece | null)[][]) => void,
  fen: string,
  setFen: (fen: string) => void,
  turn: Color,
  setTurn: (turn: Color) => void,
  firstSelectedTile: Square | null,
  setFirstSelectedTile: (tile: Square | null) => void,
  secondSelectedTile: Square | null,
  setSecondSelectedTile: (tile: Square | null) => void,
  highlightedTiles: {from: Square, to: Square} | null,
  setHighlightedTiles: (highlightedTiles: {from: Square, to: Square} | null) => void,
  handlingMove: boolean,
  setHandlingMove: (handlingMove: boolean) => void,
  isCurrentKingInCheck: boolean,
  setIsCurrentKingInCheck: (isCurrentKingInCheck: boolean) => void,
  isGameOver: boolean,
  setIsGameOver: (isGameOver: boolean) => void,
  engineSide: Color,
  isGameStarted: boolean,
  difficulty: Difficulty,
  viewingOldHalfmove: boolean,
  moveHistory: Move[],
  setMoveHistory: (moveHistory: Move[]) => void,
  fenHistory: string[],
  setFenHistory: (fenHistory: string[]) => void,
  setHalfmoveViewIndex: (halfmoveViewIndex: number) => void,
};

export type TileProps = {
  notation: Square,
  occupied: boolean,
  pieceOnTile: Piece | null,
  bgColor: string,
  firstSelectedTile: Square | null,
  setFirstSelectedTile: (tile: Square | null) => void,
  secondSelectedTile: Square | null,
  setSecondSelectedTile: (tile: Square | null) => void,
  turn: Color,
  isCurrentKingInCheck: boolean,
  isGameStarted: boolean,
  isGameOver: boolean,
  isDestinationTile: boolean,
  engineSide: Color,
  viewingOldHalfmove: boolean,
};
