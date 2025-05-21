import { GAME_STATE } from "./game.js";
import { getPiece } from "./boardUtils.js";
import { getPlayerTurn } from "./boardUtils.js";

const boardTiles = document.getElementsByClassName("square");
const darkColor = getComputedStyle(boardTiles[0]).backgroundColor;
const lightColor = getComputedStyle(boardTiles[1]).backgroundColor;

export const hideForm = () => {
  const mainContainer = document.querySelector('.main-container');
  mainContainer.removeChild(mainContainer.querySelector('.form-container'));
}

export const displayNames = (whiteName, blackName) => {
  console.error("player is: ", getPlayerTurn(), "white name is: ", whiteName, "black name is: ", blackName);
  const whiteNameElement = document.getElementById("white-name");
  whiteNameElement.querySelector('p').textContent = whiteName;

  const blackNameElement = document.getElementById("black-name");
  blackNameElement.querySelector('p').textContent = blackName;
}

export const displayMessage = (message, isSentBySelf, username) => {
  const listItem = document.createElement("li");
  listItem.innerHTML = `<span style="font-weight:bold;">${isSentBySelf ? "You" : username}</span>: ${message}`;
  const messages = document.getElementById("message-list");
  listItem.style.backgroundColor = messages.childElementCount % 2 === 1 ? "white" : "lightgrey";
  messages.appendChild(listItem);
  messages.scrollTop = messages.scrollHeight;
}

export const displayNotatedMove = (notatedMove) => {
  const moveDisplayContainer = document.getElementById('move-display-container');
  if (GAME_STATE.moves.length % 2 !== 0) {
    let moveContainer = document.createElement('p');
    moveContainer.textContent = `${(1 + GAME_STATE.moves.length) / 2}. ${notatedMove}`;
    moveDisplayContainer.appendChild(moveContainer);
  } else {
    if (moveDisplayContainer.lastElementChild){
      moveDisplayContainer.lastElementChild.textContent += `  ${notatedMove}`;
    } else {
      console.error('No last element found to append the move');
    }
  }
}

export const displayCapturedPiece = (capturedImgElement, piece) => {
  capturedImgElement.width = 30; capturedImgElement.height = 30;
  
  let capturedPieceDiv = document.createElement("div");
  capturedPieceDiv.classList.add("piece");
  capturedPieceDiv.appendChild(capturedImgElement);
  
  let piecesGroupContainer = document.querySelector(`.captured-piece-group#${piece}`);
  piecesGroupContainer.appendChild(capturedPieceDiv);

  if (piecesGroupContainer.getElementsByClassName("piece").length === 1) {
    console.log(`${piece} is ${'a'.charCodeAt() <= piece.charCodeAt() && piece.charCodeAt() <= 'z'.charCodeAt() ? 'lowercase.' : 'uppercase.'}`);
    document.querySelector(`.captured-pieces#${'a'.charCodeAt() <= piece.charCodeAt() && piece.charCodeAt() <= 'z'.charCodeAt() ? 'b' : 'w'}`).appendChild(piecesGroupContainer);
  }
}

export const displayCheck = (kingLocation) => {
  let attackedKingSquare = getPiece(kingLocation);
  attackedKingSquare.style.backgroundColor = "rgb(255,0,0)";
}

export const toggleSquareColor = (tileElement, originalColor) => {
  tileElement.style.backgroundColor = originalColor || "rgb(255, 255, 0)";
}

export const dehighlightKingSquare = (kingLocation, kingOriginalLocation) => {
  let kingSquare = getPiece(kingLocation);
  console.log(`king originally at ${kingSquare.id} is ${kingSquare.style.backgroundColor}`);
  if (kingSquare.style.backgroundColor === "rgb(255, 0, 0)"){
    kingSquare.style.backgroundColor = (kingLocation[0] + kingLocation[1]) % 2 === 0 ? darkColor : lightColor;
  } else {
    kingSquare = getPiece(kingOriginalLocation);
    console.log(`king at ${kingSquare.id} is ${kingSquare.style.backgroundColor}`);
    kingSquare.style.backgroundColor = (kingOriginalLocation[0] + kingOriginalLocation[1]) % 2 === 0 ? darkColor : lightColor;
  }
}

export const displayOpponentPromotion = (playerMoveInfo) => {
  let promotionSquareElement = getPiece(playerMoveInfo.move[1]);
  promotionSquareElement.innerHTML = playerMoveInfo.promotionPiece;
}

export const displayCheckmate = () => {
  alert(`${getPlayerTurn() === "white" ? "White" : "Black"} wins by checkmate!`);
}

export const displayStalemate = () => {
  alert(`Draw by stalemate!`);
}

export const displayAbandonment = () => {
  alert(`${getPlayerTurn() === "white" ? "Black" : "White"} wins by abandonment!`);
}

export const displayTimeout = () => {
  alert(`${getPlayerTurn() === "white" ? "Black" : "White"} wins by timeout!`);
}
