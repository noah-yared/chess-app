import { useEffect, useRef } from "react";
import Tile from "./Tile";
import { RANKS, FILES, SQUARE_COLORS, INITIAL_VALID_MOVES } from "../../shared/constants/chess";
import { handlePlayerMove } from "../utils/moveValidation";
import type { ChessboardProps, MoveList } from "../../shared/types/chess";
import { EngineAPI } from "../utils/engineApi";
import { Client } from "../utils/client";
import { fenToBoard } from "../utils/helpers";

export default function Chessboard({
  fen, setFen,
  board, setBoard,
  turn, setTurn,
  firstSelectedTile, setFirstSelectedTile,
  secondSelectedTile, setSecondSelectedTile,
  isGameOver, setIsGameOver,
  engineSide
}: ChessboardProps) {
  const validPlayerMoves = useRef<MoveList>(INITIAL_VALID_MOVES);

  useEffect(() => {
    if (isGameOver)
      return;
    // make sure that its the player's turn to move (i.e. not engine's turn)
    if (firstSelectedTile && secondSelectedTile && turn !== engineSide) {
      handlePlayerMove(fen, setFen, setBoard, firstSelectedTile, secondSelectedTile, turn, setTurn, setIsGameOver, validPlayerMoves);
      
      // reset selected tiles
      setFirstSelectedTile(null);
      setSecondSelectedTile(null);
    }
  }, [firstSelectedTile, secondSelectedTile, turn, engineSide, fen, isGameOver,
      setFen, setBoard, setTurn, setFirstSelectedTile, setSecondSelectedTile, setIsGameOver]);

  useEffect(() => {
    if (isGameOver)
      return;
    // engine is always black
    if (turn === engineSide) {
      const makeEngineMove = async () => {
        const engine = new EngineAPI(new Client());
        const { newFen, legalMoves } = await engine.getEngineResponse(fen);
        setFen(newFen);
        setBoard(fenToBoard(newFen));
        setTurn('w');
        setIsGameOver(legalMoves.size === 0);
        validPlayerMoves.current = legalMoves;
      }
      makeEngineMove();
    }
  }, [turn, engineSide, fen, setFen, setBoard, setTurn, isGameOver, setIsGameOver]);


  return (
    <div className='chessboard'>
      {board.flatMap((row, rowIndex) => {
        return row.map((tile, colIndex) => {
          const color = (rowIndex + colIndex) % 2 === 0 ? SQUARE_COLORS.LIGHT : SQUARE_COLORS.DARK;
          const notation = `${FILES[colIndex]}${RANKS[rowIndex]}` as const;
          const isDestinationTile = firstSelectedTile !== null && secondSelectedTile === null &&
            (validPlayerMoves.current.get(firstSelectedTile)?.some(other => other.to === notation) ?? false);
          return <Tile key={notation}
                       notation={notation} 
                       occupied={tile !== null} 
                       pieceOnTile={tile} 
                       bgColor={(notation === firstSelectedTile) ? 'yellow' : color}
                       firstSelectedTile={firstSelectedTile}
                       setFirstSelectedTile={setFirstSelectedTile}
                       secondSelectedTile={secondSelectedTile}
                       setSecondSelectedTile={setSecondSelectedTile}
                       turn={turn}
                       isGameOver={isGameOver}
                       isDestinationTile={isDestinationTile} />;
        });
      })}
    </div>
  );
}