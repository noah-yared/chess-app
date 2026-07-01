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
        Game ended
      </h2>
    )}
    {!isGameOver && viewingOldHalfmove && (
      <h2 className={`status-message history-viewing`}>
        <span>Reviewing history</span>
        <small>Select the latest move to resume</small>
      </h2>
    )}
    {!isGameOver && !viewingOldHalfmove && (
      <h2 className={`status-message ${
        isEngineToMove ? "engine-thinking" :
                         "player-turn"
      }`}>
        {isEngineToMove ? "Engine thinking"
                        : "Your move"}
      </h2>
    )}
    </>
  );

  const gameStatusElement = (
    <>
    {!isGameOver && isCurrentKingInCheck && (
      <h2 className={`status-message checkmate`}>
        {`${(turn == 'w') ? "White" : "Black"} is in check`}
      </h2>
    )}
    {isGameOver ? (
      <h2 className={`status-message game-over ${
        isCurrentKingInCheck ? `checkmate ${turn === 'w' ? 'black' : 'white'}-wins`
                             : "stalemate"
      }`}>
        {isCurrentKingInCheck ? `${turn === 'w' ? 'Black' : 'White'} wins by checkmate`
                              : "Draw by stalemate"}
      </h2>
    ) : null}
    </>
  );

  return (
    <div className='logger-container'>
      <div className="status-stack">
        {turnStatusElement}
        {gameStatusElement}
      </div>
      <div className="controls-toolbar" aria-label="Game controls">
        <button
          type="button"
          className="control-button primary"
          onClick={reset}
          aria-label={isGameOver ? "Start a new game" : "Restart game"}
          title={isGameOver ? "Start a new game" : "Restart game"}
        >
          <span className="control-button-icon" aria-hidden="true">↻</span>
          <span>{isGameOver ? "New game" : "Reset"}</span>
        </button>
      </div>
    </div>
  );
}
