import { useEffect, useRef, useState } from "react";
import Chessboard from "./Chessboard";
import { restoreGame, sendHeartbeat, hasClientTimedOut, saveGame } from "../utils/helpers";
import { STARTING_BOARD, STARTING_FEN, INITIAL_VALID_MOVES, HEARTBEAT_INTERVAL, RESTORE_INTERVAL } from "../../shared/constants/chess";
import type { Color, Difficulty, Move, MoveList, Piece, Square } from "../../shared/types/chess";
import History from "./History";
import Menu from "./Menu";
import Logger from "./Logger";

export default function Game() {
  const [board, setBoard] = useState<Array<Array<Piece | null>>>(STARTING_BOARD);
  const [fen, setFen] = useState<string>(STARTING_FEN);
  const [turn, setTurn] = useState<Color>('w');
  const [firstSelectedTile, setFirstSelectedTile] = useState<Square | null>(null);
  const [secondSelectedTile, setSecondSelectedTile] = useState<Square | null>(null);
  const [highlightedTiles, setHighlightedTiles] = useState<{from: Square, to: Square} | null>(null);
  const [handlingMove, setHandlingMove] = useState(false);
  const [isCurrentKingInCheck, setIsCurrentKingInCheck] = useState(false);
  const [engineSide, setEngineSide] = useState<Color>('b');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [fenHistory, setFenHistory] = useState<string[]>([STARTING_FEN]);
  const [viewingOldHalfmove, setViewingOldHalfmove] = useState(false);
  const [halfmoveViewIndex, setHalfmoveViewIndex] = useState(-1);

  const validPlayerMoves = useRef<MoveList>(INITIAL_VALID_MOVES);
  const isGameStartedRef = useRef(isGameStarted);

  // Keep the ref in sync with the state
  useEffect(() => {
    isGameStartedRef.current = isGameStarted;
  }, [isGameStarted]);

  useEffect(() => {
    const heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(heartbeatInterval); // remove heartbeat on unmount
  }, []);

  useEffect(() => {
    const restoreInterval = setInterval(async () => {
      if (!(!isGameStartedRef.current || (await hasClientTimedOut()))) // client is still alive, no need to restore
        return;

      restoreGame(
        setBoard,
        setFen,
        setTurn,
        setFirstSelectedTile,
        setSecondSelectedTile,
        setHighlightedTiles,
        setHandlingMove,
        setIsCurrentKingInCheck,
        setEngineSide,
        setDifficulty,
        setIsGameStarted,
        setIsGameOver,
        setMoveHistory,
        setFenHistory,
        setViewingOldHalfmove,
        setHalfmoveViewIndex,
        validPlayerMoves,
      );
    }, RESTORE_INTERVAL);
    return () => clearInterval(restoreInterval);
  }, []);

  useEffect(() => {
    if (!isGameStarted || viewingOldHalfmove)
      return; // no need to save if game hasn't started or if viewing old board state

    saveGame(
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
      validPlayerMoves,
    )
  }, [turn]);

  return (
    <div className="game-container">
      {!isGameStarted && (
        <Menu
          engineSide={engineSide}
          setEngineSide={setEngineSide}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isGameStarted={isGameStarted}
          setIsGameStarted={setIsGameStarted}
        />
      )}
      {isGameStarted && (
        <div className="game-info-container">
          <History
            moveHistory={moveHistory}
            fenHistory={fenHistory}
            setIsGameOver={setIsGameOver}
            setIsKingInCheck={setIsCurrentKingInCheck}
            setBoard={setBoard}
            setFen={setFen}
            setViewingOldHalfmove={setViewingOldHalfmove}
            setTurn={setTurn}
            setHighlightedTiles={setHighlightedTiles}
            setFirstSelectedTile={setFirstSelectedTile}
            setSecondSelectedTile={setSecondSelectedTile}
            halfmoveViewIndex={halfmoveViewIndex}
            setHalfmoveViewIndex={setHalfmoveViewIndex}
          />
          <Logger
            turn={turn}
            engineSide={engineSide}
            isCurrentKingInCheck={isCurrentKingInCheck}
            isGameOver={isGameOver}
            viewingOldHalfmove={viewingOldHalfmove}
            setBoard={setBoard}
            setFen={setFen}
            setTurn={setTurn}
            setFirstSelectedTile={setFirstSelectedTile}
            setSecondSelectedTile={setSecondSelectedTile}
            setHighlightedTiles={setHighlightedTiles}
            setHandlingMove={setHandlingMove}
            setIsCurrentKingInCheck={setIsCurrentKingInCheck}
            setEngineSide={setEngineSide}
            setDifficulty={setDifficulty}
            setIsGameStarted={setIsGameStarted}
            setIsGameOver={setIsGameOver}
            setMoveHistory={setMoveHistory}
            setFenHistory={setFenHistory}
            setViewingOldHalfmove={setViewingOldHalfmove}
            setHalfmoveViewIndex={setHalfmoveViewIndex}
            validPlayerMoves={validPlayerMoves}
          />
        </div>
      )}
      <Chessboard
        board={board}
        setBoard={setBoard}
        fen={fen}
        setFen={setFen}
        turn={turn}
        setTurn={setTurn}
        firstSelectedTile={firstSelectedTile}
        setFirstSelectedTile={setFirstSelectedTile}
        secondSelectedTile={secondSelectedTile}
        setSecondSelectedTile={setSecondSelectedTile}
        highlightedTiles={highlightedTiles}
        setHighlightedTiles={setHighlightedTiles}
        handlingMove={handlingMove}
        setHandlingMove={setHandlingMove}
        isCurrentKingInCheck={isCurrentKingInCheck}
        setIsCurrentKingInCheck={setIsCurrentKingInCheck}
        isGameOver={isGameOver}
        setIsGameOver={setIsGameOver}
        engineSide={engineSide} // default to computer playing black
        isGameStarted={isGameStarted}
        difficulty={difficulty}
        viewingOldHalfmove={viewingOldHalfmove}
        moveHistory={moveHistory}
        setMoveHistory={setMoveHistory}
        fenHistory={fenHistory}
        setFenHistory={setFenHistory}
        setHalfmoveViewIndex={setHalfmoveViewIndex}
        validPlayerMoves={validPlayerMoves}
      />
    </div>
  );
}