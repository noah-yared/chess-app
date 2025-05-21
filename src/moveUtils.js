import { GAME_STATE } from "./game.js";
import { validateMove, identifyGameStateAfterPiecePromotion } from "./server.js";
import { displayNotatedMove, displayCapturedPiece, dehighlightKingSquare, displayCheck, displayCheckmate, displayStalemate, displayOpponentPromotion } from "./uiHelpers.js";
import { getPlayerTurn, getPiece, getAlgebraicSquareNotation, updatePromotedPawnFEN } from "./boardUtils.js";

const makeMove = (startTile, endTile, result) => {
  const capturedPieceImage = endTile.querySelector("img");
  if (capturedPieceImage && !result["enpassant"]) {
    displayCapturedPiece(capturedPieceImage, capturedPieceImage.className);
  }
  endTile.innerHTML = startTile.innerHTML;
  startTile.innerHTML = "";
}

const getMoveNotation = (playerMoveInfo, result) => {
  let notatedMove;
  if (result["castled"]) {
    notatedMove = move[0][1] > move[1][1] ? 'o-o-o' : 'o-o';
    return getPlayerTurn() === "white" ? notatedMove.toUpperCase() : notatedMove; 
  }
  
  let movedPiece = result["movedPiece"];
  notatedMove = movedPiece.toLowerCase() !== 'p' ? movedPiece : '';
  notatedMove += !'pqbk'.includes(movedPiece.toLowerCase()) || (result["capturedPiece"] && !notatedMove) ? String.fromCharCode(move[0][1] + 'a'.charCodeAt()) : '';
  notatedMove += result["capturedPiece"] !== null ? 'x' : '';
  notatedMove += getAlgebraicSquareNotation(move[1]);
  notatedMove += result["promotion"] ? `=${window.promotionId}` : '';
  notatedMove += result["checkmate"] ? `#` : result["check"] ? '+' : '';
  return notatedMove;
}

const handleEnpassantMove = (move) => {
  let capturedPieceLocation = move[1][0] === 2 ? [3, move[1][1]] : [4, move[1][1]];
  let capturedPiece = getPiece(capturedPieceLocation);
  let capturedPieceImage = capturedPiece.querySelector('img');
  displayCapturedPiece(capturedPieceImage, capturedPieceImage.src.includes("white") ? 'P' : 'p');  
  capturedPiece.innerHTML = "";
}

const handleCastledMove = (move) => {
  let rookInitialLocation = [move[0][0], move[1][1] > move[0][1] ? 7 : 0];
  let rookFinalLocation = [move[0][0], rookInitialLocation[1] === 7 ? 5 : 3];
  let rookInitialSquare = getPiece(rookInitialLocation);
  let rookFinalSquare = getPiece(rookFinalLocation);
  rookFinalSquare.innerHTML = rookInitialSquare.innerHTML;
  rookInitialSquare.innerHTML = "";
}

const setupPawnPromotionOptions = (move) => {
  let color = move[1][0] === 0 ? "white" : "black";
  let promotionOptionsElement = document.getElementById(`promotion-options-${color}`);
  promotionOptionsElement.style.display = "grid";
  promotionOptionsElement.style.position = "absolute";
  let finalSquareRect = getPiece(move[1]).getBoundingClientRect();
  let width = promotionOptionsElement.offsetWidth;
  if (move[1][1] < 4) {
    promotionOptionsElement.style.left = `${finalSquareRect.left + window.scrollX}px`;
  } else {
    promotionOptionsElement.style.left = `${finalSquareRect.right + window.scrollX - width}px`;
  }
  let height = promotionOptionsElement.offsetHeight;
  if (move[1][0] === 0) {
    promotionOptionsElement.style.top = `${finalSquareRect.bottom + window.scrollY}px`;
  } else {
    promotionOptionsElement.style.top = `${finalSquareRect.top + window.scrollY - height}px`;
  }
}

const pollHasUserChosenPromotionPiece = async () => {
  while (!GAME_STATE.hasUserChosenPromotionPiece) {
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
}

const handlePromotionMove = async (move, moveResult) => {
  console.log(`move: ${move}, moveResult: ${moveResult}`);
  GAME_STATE.hasUserChosenPromotionPiece = false;
  setupPawnPromotionOptions(move);
  await pollHasUserChosenPromotionPiece();
  updatePromotedPawnFEN(move, window.promotionId);
  return await identifyGameStateAfterPiecePromotion(moveResult["oppKing"]);
}

export const handleMove = async (playerMoveInfo, startSquareElement, endSquareElement) => {
  let moveMade = false, playerMove = playerMoveInfo, result;
  window.move = playerMove.move ?? playerMove;
  try {
    result = playerMoveInfo.result ?? await validateMove(playerMove);
  } catch (error) {
    console.error(`Error when validating move: ${error}`);
    return;
  }
  if (result["valid"]) {
    moveMade = true; 
    GAME_STATE.boardFEN = result.fen;
    GAME_STATE.boardStates.push(result.fen);
    if (GAME_STATE.wasPreviousMoveCheck) {
      dehighlightKingSquare(result["allyKing"], window.move[0]);
      GAME_STATE.wasPreviousMoveCheck = false;
    }
    makeMove(startSquareElement, endSquareElement, result)
    if (result["enpassant"]) {
      handleEnpassantMove(playerMove);
    } else if (result["castled"]) {
      handleCastledMove(playerMove);
    } else if (result["promotion"]) {
      if (window.gameType !== "sockets" || window.isPlayersTurn) {
        const updatedState = await handlePromotionMove(playerMove, result);
        result = { ...result, ...updatedState };
      } else {
        displayOpponentPromotion(playerMoveInfo);
        updatePromotedPawnFEN(playerMoveInfo.move, playerMoveInfo.promotionId);
      }
    }
    if (result["checkmate"]) requestAnimationFrame(() => setTimeout(displayCheckmate, 100)); // force repaint before displaying checkmate alert
    else if (result["stalemate"]) requestAnimationFrame(() => setTimeout(displayStalemate, 100)); // force repaint before displaying stalemate alert
    else if (result["check"]) { displayCheck(result["oppKing"]); GAME_STATE.wasPreviousMoveCheck = true; }
    const notatedMove = playerMoveInfo.notatedMove ?? getMoveNotation(playerMoveInfo, result);
    GAME_STATE.moves.push(notatedMove);
    displayNotatedMove(notatedMove); // add move to display
    if (window.gameType === "sockets" && window.isPlayersTurn) {
      window.socket.emit("move", { 
        "move": playerMove, 
        "result": result,
        "notatedMove": notatedMove,
        "promotionPiece": window.promotionPieceElement,
        "promotionId": window.promotionId,
      });
      window.promotionPieceElement = null;
    }
  } 
  GAME_STATE.isProcessingMove = false;
  GAME_STATE.currentMove = null;
  GAME_STATE.currentStartSquare = null;
  GAME_STATE.currentStartSquareElement = null;
  GAME_STATE.currentEndSquareElement = null;
  if (moveMade) window.isPlayersTurn = !window.isPlayersTurn;
}
