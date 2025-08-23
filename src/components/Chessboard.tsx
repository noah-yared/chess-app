import { useEffect, useRef } from "react";
import Tile from "./Tile";
import { RANKS, FILES, SQUARE_COLORS, INITIAL_VALID_MOVES } from "../../shared/constants/chess";
import { handlePlayerMove } from "../utils/moveValidation";
import type { ChessboardProps, MoveList } from "../../shared/types/chess";
import { EngineAPI } from "../utils/engineApi";
import { Client } from "../utils/client";
import { fenToBoard } from "../utils/helpers";

export default function Chessboard({
  fen,
  setFen,
  board,
  setBoard,
  turn,
  setTurn,
  firstSelectedTile,
  setFirstSelectedTile,
  secondSelectedTile,
  setSecondSelectedTile,
  highlightedTiles,
  setHighlightedTiles,
  handlingMove,
  setHandlingMove,
  isCurrentKingInCheck,
  setIsCurrentKingInCheck,
  isGameOver,
  setIsGameOver,
  isGameStarted,
  engineSide,
  difficulty
}: ChessboardProps) {
  const validPlayerMoves = useRef<MoveList>(INITIAL_VALID_MOVES);
  useEffect(() => {
    if (!isGameStarted || isGameOver || turn === engineSide || handlingMove)
      return;
    // make sure that its the player's turn to move (i.e. not engine's turn)
    if (firstSelectedTile && secondSelectedTile) {
      setHandlingMove(true);
      handlePlayerMove(fen, setFen, setBoard, firstSelectedTile, secondSelectedTile,
        setHighlightedTiles, setIsCurrentKingInCheck, turn, setTurn, setIsGameOver,
        validPlayerMoves);
      // reset selected tiles
      setFirstSelectedTile(null);
      setSecondSelectedTile(null);
      setHandlingMove(false);
    }
  }, [
    firstSelectedTile,
    secondSelectedTile,
    turn,
    engineSide,
    fen,
    isGameOver,
    setFen,
    setBoard,
    setTurn,
    setFirstSelectedTile,
    setSecondSelectedTile,
    setIsGameOver
  ]);

  useEffect(() => {
    if (!isGameStarted || isGameOver || turn !== engineSide || handlingMove)
      return;

    const makeEngineMove = async () => {
      setHandlingMove(true);
      const engine = new EngineAPI(new Client());
      const { response, newFen, legalMoves } = await engine.getEngineResponse(fen, difficulty);
      setIsCurrentKingInCheck(await engine.isKingInCheck(newFen));
      setFen(newFen);
      setBoard(fenToBoard(newFen));
      setTurn(engineSide === 'w' ? 'b' : 'w');
      setIsGameOver(legalMoves.size === 0);
      setHighlightedTiles(response);
      validPlayerMoves.current = legalMoves;
      setHandlingMove(false);
    }

    makeEngineMove();
  }, [
    turn,
    engineSide,
    fen,
    setFen,
    setBoard,
    setTurn,
    isGameOver,
    setIsGameOver,
    isGameStarted
  ]);


  return (
    <div className='chessboard'>
      {board.flatMap((row, rowIndex) => {
        return row.map((tile, colIndex) => {
          const defaultBgColor = (rowIndex + colIndex) % 2 === 0 ? SQUARE_COLORS.LIGHT : SQUARE_COLORS.DARK;
          const notation = `${FILES[colIndex]}${RANKS[rowIndex]}` as const;
          const { from, to } = highlightedTiles ?? { from: null, to: null };
          const bgColor = from === notation || to === notation  ? 'lightgreen' :
            notation === firstSelectedTile ? 'yellow' : defaultBgColor;
          const isDestinationTile = firstSelectedTile !== null && secondSelectedTile === null &&
            (validPlayerMoves.current.get(firstSelectedTile)?.some(other => other.to === notation) ?? false);
          return <Tile key={notation}
                       notation={notation} 
                       occupied={tile !== null} 
                       pieceOnTile={tile} 
                       bgColor={bgColor}
                       firstSelectedTile={firstSelectedTile}
                       setFirstSelectedTile={setFirstSelectedTile}
                       secondSelectedTile={secondSelectedTile}
                       setSecondSelectedTile={setSecondSelectedTile}
                       turn={turn}
                       isCurrentKingInCheck={isCurrentKingInCheck}
                       isGameStarted={isGameStarted}
                       isGameOver={isGameOver}
                       isDestinationTile={isDestinationTile}
                       engineSide={engineSide} />;
        });
      })}
    </div>
  );
}