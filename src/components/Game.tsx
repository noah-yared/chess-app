import { useState } from "react"
import Chessboard from "./Chessboard"
import { STARTING_BOARD, STARTING_FEN } from "../../shared/constants/chess"
import type { Color, Difficulty, Move, Piece, Square } from "../../shared/types/chess"
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
          />
          <Logger
            turn={turn}
            engineSide={engineSide}
            isCurrentKingInCheck={isCurrentKingInCheck}
            isGameOver={isGameOver}
            viewingOldHalfmove={viewingOldHalfmove}
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
      />
      {/* {isGameStarted && (
        <Logger
          turn={turn}
          engineSide={engineSide}
          isCurrentKingInCheck={isCurrentKingInCheck}
          isGameOver={isGameOver}
        />
      )} */}
    </div>
  );
}