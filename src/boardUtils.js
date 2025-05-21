import { GAME_STATE } from "./game.js";

export const getAlgebraicSquareNotation = square => `${String.fromCharCode(square[1] + 'a'.charCodeAt())}${8-square[0]}`

export const getPlayerTurn = () => GAME_STATE.moves.length % 2 === 0 ? "white" : "black";

export const getPiece = (location) => document.getElementById(`${location[0]},${location[1]}`);

export const getIndex = (square) => 8*square[0] + square[1];

export const getBoardCoordinates = tile => [Number(tile.id[0]), Number(tile.id[2])]

export const updatePromotedPawnFEN = (move, piece_type) => {
  let colIndex = 0, pawnColIndex = move[1][1];
  if (move[1][0] === 0) {
    // find first backwards slash
    let i = 0;
    while (GAME_STATE.boardFEN[i] != '/') {
      if (colIndex === pawnColIndex) {
        GAME_STATE.boardFEN = GAME_STATE.boardFEN.substring(0, i) + piece_type + GAME_STATE.boardFEN.substring(i+1);
        break; // need to replace piece
      } 
      if (!isNaN(Number(GAME_STATE.boardFEN[i]))) {
        colIndex += Number(GAME_STATE.boardFEN[i]);
      } else {
        colIndex++;
      }
      i++;
    }
  } else {
    // find last backwards slash index and go until first space
    let i = GAME_STATE.boardFEN.lastIndexOf('/') + 1;
    while (GAME_STATE.boardFEN[i] != ' ') {
      if (colIndex === pawnColIndex) {
        GAME_STATE.boardFEN = GAME_STATE.boardFEN.substring(0, i) + piece_type + GAME_STATE.boardFEN.substring(i+1);
        break;
      }
      if (!isNaN(Number(GAME_STATE.boardFEN[i]))) {
        colIndex += Number(GAME_STATE.boardFEN[i]);
      } else {
        colIndex++;
      }
      i++;
    }
  }
} 
