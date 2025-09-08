import { useEffect } from "react";
import Tile from "./Tile";
import { RANKS, FILES, SQUARE_COLORS, ENGINE_UI_SLOWDOWN_MS } from "../../shared/constants/chess";
import { processPlayerMove } from "../utils/moveValidation";
import type { ChessboardProps, Move, MoveList } from "../../shared/types/chess";
import { EngineAPI } from "../utils/engineApi";
import { Client } from "../utils/client";
import { fenToBoard, playSound } from "../utils/helpers";
import errorSound from '../assets/error.mp3';

export default function Chessboard({
  board,
  setBoard,
  fen,
  setFen,
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
  difficulty,
  viewingOldHalfmove,
  moveHistory,
  setMoveHistory,
  fenHistory,
  setFenHistory,
  setHalfmoveViewIndex,
  validPlayerMoves,
}: ChessboardProps) {
  const applyMove = async ({ from, to, promo }: Move, newFen: string, newLegalMoves: MoveList, isKingInCheck: boolean) => {
    await playSound({from, to, promo}, newLegalMoves, isKingInCheck, board);
    setBoard(fenToBoard(newFen));
    setFen(newFen);
    setIsCurrentKingInCheck(isKingInCheck);
    setFenHistory([...fenHistory, newFen]);
    setMoveHistory([...moveHistory, {from, to, promo}]);
    setTurn(turn === 'w' ? 'b' : 'w');
    setIsGameOver(newLegalMoves.size === 0);
    setHighlightedTiles({from, to});
    validPlayerMoves.current = newLegalMoves;
  }

  useEffect(() => {
    if (!isGameStarted || viewingOldHalfmove || isGameOver || turn === engineSide || handlingMove)
      return;
    // make sure that its the player's turn to move (i.e. not engine's turn)
    if (firstSelectedTile && secondSelectedTile) {
      const handlePlayerMove = async () => {
        setHandlingMove(true);
        console.log('handling player move...');
        const result = await processPlayerMove(
          firstSelectedTile, secondSelectedTile, turn, validPlayerMoves);
        console.log('player move result', result);
        if (result !== null) { // valid move
          const { move, updatedFen, newLegalMoves, isKingInCheck } = result!;
          await applyMove(move, updatedFen, newLegalMoves, isKingInCheck);
          console.log('player move applied');
        } else { // invalid move
          new Audio(errorSound).play(); // play error sound for invalid move attempt
        }
        // reset selected tiles
        setFirstSelectedTile(null);
        setSecondSelectedTile(null);
        setHandlingMove(false);
      };
      handlePlayerMove();
    }
  }, [
    firstSelectedTile,
    secondSelectedTile,
    turn,
    fen,
    engineSide,
    isGameOver,
    setTurn,
    setFirstSelectedTile,
    setSecondSelectedTile,
    setIsGameOver,
  ]);

  useEffect(() => {
    if (!isGameStarted || viewingOldHalfmove || isGameOver || turn !== engineSide || handlingMove)
      return;
    const engineHalfmoveIndex = moveHistory.length;
    const makeEngineMove = async () => {
      setHandlingMove(true);
      const engine = new EngineAPI(new Client());
      // Slow down ui updates for engine move so that its not jarring for user
      const slowDown = (ms: number) =>  new Promise(resolve => setTimeout(resolve, ms));
      const [, { response, newFen, legalMoves }] = await Promise.all([
        slowDown(ENGINE_UI_SLOWDOWN_MS), 
        engine.getEngineResponse(difficulty)]);
      const isKingInCheck = await engine.isKingInCheck();
      await applyMove(response, newFen, legalMoves, isKingInCheck);
      setHalfmoveViewIndex(engineHalfmoveIndex);
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
                       engineSide={engineSide}
                       viewingOldHalfmove={viewingOldHalfmove} />
        });
      })}
    </div>
  );
}