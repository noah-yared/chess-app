import "./server.js";
import "./uiHelpers.js";
import { getPiece } from "./boardUtils.js";
import { setupForm, setupMessageBox, setupPromotionPieces, setupBoardTiles } from "./eventHandlers.js";
import { handleMove } from "./moveUtils.js";

const DEFAULT_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - ";

export const GAME_STATE = {
  // game settings
  hasUserSelectedGameSettings: false,
  hasUserChosenPromotionPiece: false,

  // current board state
  boardFEN: DEFAULT_BOARD_FEN,
  boardStates: [ DEFAULT_BOARD_FEN, ],
  moves: [],
  wasPreviousMoveCheck: false,

  // current move state
  isProcessingMove: false,
  currentMove: null,
  currentStartSquare: null,
  currentStartSquareColor: null,
  currentStartSquareElement: null,
  currentEndSquareElement: null,
};

const setupWindowSocketListeners = () => {
  window.socket.on("startGame", async () => {
    try {
      await startGame();
    } catch (error) {
      console.error(`Error when starting online game: ${error}`);
    } finally {
      console.log("Game started!");
    }
  });

  window.socket.on("displayMove", async playerMoveInfo => {
    let startSquareElement = getPiece(playerMoveInfo.move[0]);
    let endSquareElement = getPiece(playerMoveInfo.move[1]);
    await handleMove(playerMoveInfo, startSquareElement, endSquareElement);
  });
}

const pollHasUserSelectedGameSettings = async () => {
  while (!GAME_STATE.hasUserSelectedGameSettings) {
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    })
  }
}

(window.gameType !== "sockets") && setupForm();

const startGame = async () => {
  window.gameOver = false; window.promotionPieceElement = null; window.move = null;
  // setup event listeners
  setupMessageBox();
  setupPromotionPieces();
  setupBoardTiles();
}

const main = async () => {
  if (window.gameType === "sockets") {
    setupWindowSocketListeners();
  } else {
    try {
      await pollHasUserSelectedGameSettings();
      await startGame();
    } catch (error) {
      console.error(`Error when starting local game: ${error}`);
    } finally {
      console.log("Game started!");
    }
  }
}

main();
