import { useState } from "react"
import Chessboard from "./Chessboard"
import { STARTING_BOARD, STARTING_FEN } from "../../shared/constants/chess"
import type { Color, Piece, Square } from "../../shared/types/chess"

export default function Game({ engineSide }: { engineSide?: Color }) {
  const [board, setBoard] = useState<Array<Array<Piece | null>>>(STARTING_BOARD);
  const [fen, setFen] = useState<string>(STARTING_FEN);
  const [turn, setTurn] = useState<Color>('w');
  const [firstSelectedTile, setFirstSelectedTile] = useState<Square | null>(null);
  const [secondSelectedTile, setSecondSelectedTile] = useState<Square | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  return (
    <>
      <Chessboard
        fen={fen}
        setFen={setFen}
        board={board}
        setBoard={setBoard}
        turn={turn}
        setTurn={setTurn}
        firstSelectedTile={firstSelectedTile}
        setFirstSelectedTile={setFirstSelectedTile}
        secondSelectedTile={secondSelectedTile}
        setSecondSelectedTile={setSecondSelectedTile}
        isGameOver={isGameOver}
        setIsGameOver={setIsGameOver}
        engineSide={engineSide ?? 'b'} // default to computer playing black
      />
    </>

  );
}