import { GAME_STATE } from "./game.js";
import { getBoardCoordinates, getPiece, getPlayerTurn, updatePromotedPawnFEN } from "./boardUtils.js";
import { handleMove } from "./moveUtils.js";
import { displayNames, hideForm, displayMessage, displayCapturedPiece, toggleSquareColor } from "./uiHelpers.js";

export const setupForm = () => {
  const form = document.getElementById("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    // const timeControl = formData.get("time");
    const whiteName = formData.get("white-name");
    const blackName = formData.get("black-name");
    if (!whiteName.trim() || !blackName.trim()){
      alert("Player names cannot be empty");
      return;
    } else if (whiteName.trim() === blackName.trim()) {
      alert("Player names cannot be the same");
      return;
    }
    hideForm();
    displayNames(whiteName, blackName)
    // setupClocks(timeControl);
    GAME_STATE.hasUserSelectedGameSettings = true;
  });
}

export const setupMessageBox = () => {
  console.log(window.playerColor);
  (window.playerColor === "white") ? displayNames("You", "Opponent") : displayNames("Opponent", "You");
  document.getElementById("send-chat").addEventListener("click", () => {
    // const form = document.getElementById("message-form");
    // const formData = new FormData(form);
    const messageBox = document.getElementById("message-box");
    const message = messageBox.value;
    messageBox.value = "";
    if (!message.trim()) {
      alert("Cannot send empty chat message.")
      return;
    }
    window.socket.emit("chatMessage", (message.trim()));
    displayMessage(message, true);
  })
  window.socket.on("displayMessage", (message, username) => {
    displayMessage(message, false, username);
  })
}

export const setupPromotionPieces = () => {
  const promotionPieces = window.gameType === "sockets"
    ? document.querySelectorAll(`#promotion-options-${window.playerColor} > .promotion-piece`) 
    : document.getElementsByClassName("promotion-piece");
  for (let promotionPiece of promotionPieces) {
    promotionPiece.addEventListener("click", () => {
      let pawnToPromote = getPiece(window.move[1]);
      let pawnImage = pawnToPromote.querySelector("img");
      displayCapturedPiece(pawnImage, pawnImage.src.includes("white") ? 'P' : 'p');

      pawnToPromote.innerHTML = promotionPiece.innerHTML;
      window.promotionPieceElement = promotionPiece.innerHTML; // store promotionPiece.innerHTML in global var
      window.promotionId = promotionPiece.id;

      let color = window.move[1][0] === 0 ? "white" : "black";
      let promotionOptionsGrid = document.getElementById(`promotion-options-${color}`);
      promotionOptionsGrid.style.display = "none";

      GAME_STATE.hasUserChosenPromotionPiece = true;
    });
  }
}

export const setupBoardTiles = async () => {
  const boardTiles = document.getElementsByClassName("square");
  for (let tile of boardTiles) {
    tile.addEventListener("click", async e => {
      if (GAME_STATE.isProcessingMove || (window.gameType == "sockets" && !window.isPlayersTurn)) return;
      const newSquare = getBoardCoordinates(tile);
      if (!GAME_STATE.currentStartSquare && tile.querySelectorAll("img").length) {
        if (!tile.querySelector("img").src.includes(getPlayerTurn())) {
          console.log("cant move this piece");
          return;
        }
        GAME_STATE.currentStartSquare = newSquare;
        GAME_STATE.currentStartSquareElement = tile;
        GAME_STATE.currentStartSquareColor = getComputedStyle(tile).backgroundColor;
        toggleSquareColor(tile, null); // highlight square
      } else if (GAME_STATE.currentStartSquare) {
        GAME_STATE.currentMove = [GAME_STATE.currentStartSquare, newSquare];
        GAME_STATE.currentEndSquareElement = tile;
        toggleSquareColor(GAME_STATE.currentStartSquareElement, GAME_STATE.currentStartSquareColor); // de-highlight square
      }
      if (GAME_STATE.currentMove) {
        await handleMove(GAME_STATE.currentMove, GAME_STATE.currentStartSquareElement, GAME_STATE.currentEndSquareElement);
      }
    });
  }
}