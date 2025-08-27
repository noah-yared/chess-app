import type { LoggerProps } from '../../shared/types/chess';
import { resetGame } from '../utils/helpers';

export default function Logger({
  turn,
  engineSide,
  isCurrentKingInCheck,
  isGameOver,
  viewingOldHalfmove,
  /* setters for resetting game */
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
}: LoggerProps) {
  const isEngineToMove: boolean = turn === engineSide;
  
  const reset = () => resetGame(
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
  
  const turnStatusElement = (
    <>
    {isGameOver && (
      <h2 className={'status-message game-over'}>
        Game has ended!
      </h2>
    )}
    {!isGameOver && viewingOldHalfmove && (
      <h2 className={`status-message history-viewing`}>
        {"Viewing history 📜"}<br/>{"Click last move to continue ⏩"}
      </h2>
    )}
    {!isGameOver && !viewingOldHalfmove && (
      <h2 className={`status-message ${
        isEngineToMove ? "engine-thinking" :
                         "player-turn"
      }`}>
        {isEngineToMove ? "Engine is thinking..."
                        : "Waiting on your move..."}
      </h2>
    )}
    </>
  );
  
  const gameStatusElement = (
    <>
    {!isGameOver && isCurrentKingInCheck && (
      <h2 className={`status-message`}>
        {`${(turn == 'w') ? "White" : "Black"} is in check!`}
      </h2>
    )}
    {isGameOver ? (
      <h2 className={`status-message game-over ${
        isCurrentKingInCheck ? `checkmate ${turn === 'w' ? 'black' : 'white'}-wins`
                             : "stalemate"
      }`}>
        {isCurrentKingInCheck ? `${turn === 'w' ? 'Black' : 'White'} wins by checkmate!`
                              : "Draw by stalemate!"}
      </h2>
    ) : null}
    </>
  );
      
  return (
    <div className='logger-container'>
      {turnStatusElement}
      {gameStatusElement}
      <button onClick={reset}>{isGameOver ? "Play new game" : "Restart game"}</button>
    </div>
  );
}