export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Color = 'w' | 'b';

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

export type MoveList = Map<Square, Array<{to: Square, promoting: boolean}>>;

export type ChessboardProps = {
  fen: string,
  setFen: (fen: string) => void,
  board: (Piece | null)[][],
  setBoard: (board: (Piece | null)[][]) => void,
  turn: Color,
  setTurn: (turn: Color) => void,
  firstSelectedTile: Square | null,
  setFirstSelectedTile: (tile: Square | null) => void,
  secondSelectedTile: Square | null,
  setSecondSelectedTile: (tile: Square | null) => void,
  isGameOver: boolean,
  setIsGameOver: (isGameOver: boolean) => void,
  engineSide: Color,
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
  isGameOver: boolean,
  isDestinationTile: boolean,
};
