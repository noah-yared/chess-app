// import { loadSavedGameData, saveGameData } from './gameStateManager.js';
// import { boardRenderer } from './renderBoard.js';

// display click locations (scrolling-adjusted) in the console for reference
document.getElementsByTagName("body")[0].addEventListener('click', e => {
  console.log(`Location is ${e.clientX + window.scrollX}, ${e.clientY + window.scrollY}`)
})


const displayNames = (whiteName, blackName) => {
  const whiteNameElement = document.getElementById("white-name");
  whiteNameElement.querySelector('p').textContent = whiteName;

  const blackNameElement = document.getElementById("black-name");
  blackNameElement.querySelector('p').textContent = blackName;
}

// const setupClocks = (timeControl) => {
//   let timeRemaining = timeControl * 60;
//   let startTime = new Date();
//   // Need to implement -- made some progress in "getTime.js"
// }

const hideForm = () => {
  const mainContainer = document.querySelector('.main-container');
  mainContainer.removeChild(mainContainer.querySelector('.form-container'));
}

let hasUserSelectedGameSettings = false;

if (window.gameType !== "sockets") {
  const form = document.getElementById("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const timeControl = formData.get("time");
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
    hasUserSelectedGameSettings = true;
  });
}

const startGame = async () => {
  let originalSquareColor = null;
  let move = null;
  let startSquare = null;
  let startSquareElement = null;
  let endSquareElement = null;
  let isProcessingMove = false;
  let hasUserChosenPromotionPiece = false;
  let wasPreviousMoveCheck = false;

  window.gameOver = false;

  const boardTiles = document.getElementsByClassName("square");
  const promotionPieces = window.gameType === "sockets" 
    ? document.querySelectorAll(`#promotion-options-${window.playerColor} > .promotion-piece`) 
    : document.getElementsByClassName("promotion-piece");

  const darkColor = getComputedStyle(boardTiles[0]).backgroundColor;
  const lightColor = getComputedStyle(boardTiles[1]).backgroundColor;

  let boardFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ -";

  let moves = [];
  let board_states = [boardFEN];

  window.promotionPieceElement = null;
  window.move = null;

  if (window.gameType === "sockets")  {
    (window.playerColor === "white") ? displayNames("You", "Opponent") 
                                     : displayNames("Opponent", "You");
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
      console.log(`sending this message: ${message} `)
      window.socket.emit("chatMessage", (message.trim()));
      displayMessage(message, true);
    })
    window.socket.on("displayMessage", (message, username) => {
      console.log(`message: '${message}' from ${username}`);
      displayMessage(message, false, username);
    })
  }

  for (let promotionPiece of promotionPieces) {
    promotionPiece.addEventListener("click", () => {
      console.log(window.move);
      let pawnToPromote = getPiece(window.move[1]);
      let pawnImage = pawnToPromote.querySelector("img");
      displayCapturedPiece(pawnImage, pawnImage.src.includes("white") ? 'P' : 'p');
      pawnToPromote.innerHTML = promotionPiece.innerHTML;
      window.promotionPieceElement = promotionPiece.innerHTML; // store promotionPiece.innerHTML in global var
      window.promotionId = promotionPiece.id;
      updatePromotedPawnFEN(window.move, promotionPiece.id);
      let color = window.move[1][0] === 0 ? "white" : "black";
      let promotionOptionsGrid = document.getElementById(`promotion-options-${color}`);
      promotionOptionsGrid.style.display = "none";
      hasUserChosenPromotionPiece = true;
    })
  }

  for (let tile of boardTiles) {
    tile.addEventListener("click", async e => {
      if (isProcessingMove || (window.gameType == "sockets" && !window.isPlayersTurn)) return;
      // console.log(tile);
      let newSquare = getBoardCoordinates(tile);
      if (!startSquare && tile.querySelectorAll("img").length) {
        if (window.gameType === "sockets" && !tile.querySelector("img").src.includes(window.playerColor)) {
          console.log("cant move this piece");
          return;
        }
        startSquare = newSquare;
        startSquareElement = tile;
        originalSquareColor = getComputedStyle(startSquareElement).backgroundColor;
        toggleSquareColor(startSquareElement, null); // highlight square
      } else if (startSquare) {
        move = [startSquare, newSquare];
        console.log(move);
        endSquareElement = tile;
        toggleSquareColor(startSquareElement, originalSquareColor); // de-highlight square
      }
      if (move) {
        isProcessingMove = true;
        await handleMove(move, startSquareElement, endSquareElement);
        move = null
      }
    })
  }

  const handleMove = async (playerMoveInfo, startSquareElement, endSquareElement) => {
    let moveMade = false, playerMove;
    if (window.gameType === "sockets") {
      playerMove = window.isPlayersTurn ? playerMoveInfo : playerMoveInfo.move;
    } else {
      playerMove = playerMoveInfo
    }
    window.move = playerMove;
    validateMove(playerMove)
      .then(async result => {
        console.log("Is move valid?", result["valid"])
        if (result["valid"]) {
          moveMade = true; 
          boardFEN = result.fen;
          console.log("Board state", boardFEN)
          board_states.push(boardFEN); // store board state
          console.log(`opp king: ${result["oppKing"]}`);
          console.log(`ally king: ${result["allyKing"]}`);
          if (wasPreviousMoveCheck) {
            dehighlightKingSquare(result["allyKing"], playerMove[0]);
            wasPreviousMoveCheck = false;
          }
          makeMove(startSquareElement, endSquareElement, result)
          if (result["enpassant"]) {
            handleEnpassantMove(playerMove);
          } else if (result["castled"]) {
            handleCastledMove(playerMove);
          } else if (result["promotion"]) {
            if (window.gameType !== "sockets" || window.isPlayersTurn) {
              hasUserChosenPromotionPiece = false;
              handlePawnPromotion(playerMove);
              await pollHasUserChosenPromotionPiece();
            } else {
              displayOpponentPromotion(playerMoveInfo)
            }
            const gameState = await identifyGameStateAfterPiecePromotion(result["oppKing"]);
            result["check"] = gameState["check"];
            result["checkmate"] = gameState["checkmate"];
            result["stalemate"] = gameState["stalemate"];
          }
          if (!result["promotion"]) {
            if (result["checkmate"]) displayCheckmate()
            else if (result["stalemate"]) displayStalemate()
            else if (result["check"]) { displayCheck(result["oppKing"]); wasPreviousMoveCheck = true;}
          }
          if (window.gameType === "sockets" && window.isPlayersTurn) {
            window.socket.emit("move", { "move": playerMove, "promotionPiece": window.promotionPieceElement });
            window.promotionPieceElement = null;
          }
          let notatedMove = getMoveNotation(playerMove, result)
          console.log(notatedMove);
          moves.push(notatedMove); // push move into list of moves
          displayNotatedMove(notatedMove); // add move to display
        } 
      })
      .catch(err => console.error(`Something went wrong with move validation. Here is the error: ${err}`))
      .finally(() => {
        move = null;
        startSquare = null;
        startSquareElement = null;
        endSquareElement = null;
        isProcessingMove = false;
        if (moveMade) window.isPlayersTurn = !window.isPlayersTurn;
      })
  }

  const validateMove = async (move) => {
    console.log(`Validating ${move}`);
    return fetch('http://127.0.0.1:5000/api/validate-move', {
      "method": "POST",
      "headers": {
        Accept: "application/json",
        "Content-Type": "application/json"
      }, 
      "body": JSON.stringify({
        "board": boardFEN,
        "move": move
      })
    })
      .then(response => response.json())
      .catch(err => { throw err })
  }

  const makeMove = (startTile, endTile, result) => {
    if (result["capturedPiece"] !== null && !result["enpassant"]) {
      displayCapturedPiece(endTile.querySelector("img"), result["capturedPiece"]);
    }
    endTile.innerHTML = startTile.innerHTML;
    startTile.innerHTML = "";
  }

  const getAlgebraicSquareNotation = square => `${String.fromCharCode(square[1] + 'a'.charCodeAt())}${8-square[0]}`

  const getMoveNotation = (move, result) => {
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

  const getPlayerTurn = () => moves.length % 2 === 0 ? "white" : "black";

  const getPiece = (location) => document.getElementById(`${location[0]},${location[1]}`);

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

  const handlePawnPromotion = (move) => {
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

  const identifyGameStateAfterPiecePromotion = async (kingLocation) => {
    console.log('fen:', boardFEN);
    const res = await fetch("http://localhost:5000/api/promotion-check", {
      "method": "POST",
      "headers": {
        Accept: "application/json",
        "Content-type": "application/json"
      },
      "body": JSON.stringify({
        "fen": boardFEN,
        "king": kingLocation
      })
    });
    const data = await res.json();
    if (data["checkmate"]) { 
      displayCheckmate(); // display checkmate dialog box
    } else if (data["stalemate"]) {
      displayStalemate(); // display stalemate dialog box
    } else if (data["check"]) {
      console.log("Check was calculated!");
      displayCheck(kingLocation);
      wasPreviousMoveCheck = true;
    }
    return data;
  }

  const getIndex = (square) => {
    return 8*square[0] + square[1];
  }

  const toggleSquareColor = (tileElement, originalColor) => {
    tileElement.style.backgroundColor = originalColor || "rgb(255, 255, 0)";
  }

  const getBoardCoordinates = tile => [Number(tile.id[0]), Number(tile.id[2])]

  const pollHasUserChosenPromotionPiece = async () => {
    while (!hasUserChosenPromotionPiece) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
  }

  const displayCapturedPiece = (capturedImgElement, piece) => {
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

  const displayCheck = (kingLocation) => {
    let attackedKingSquare = getPiece(kingLocation);
    attackedKingSquare.style.backgroundColor = "rgb(255,0,0)";
  }

  const displayNotatedMove = (notatedMove) => {
    const moveDisplayContainer = document.getElementById('move-display-container');
    if (moves.length % 2) {
      let moveContainer = document.createElement('p');
      moveContainer.textContent = `${(1 + moves.length) / 2}. ${notatedMove}`;
      moveDisplayContainer.appendChild(moveContainer);
    } else {
      if (moveDisplayContainer.lastElementChild){
        moveDisplayContainer.lastElementChild.textContent += `  ${notatedMove}`;
      } else {
        console.error('No last element found to append the move');
      }
    }
  }

  const displayCheckmate = () => {
    let checkmateElement = document.getElementById("checkmate");
    checkmateElement.querySelector('p').textContent = `${getPlayerTurn() === "white" ? "White" : "Black"} wins by checkmate!` 
    centerDialogBox(checkmateElement);
  }

  const displayStalemate = () => {
    let stalemateElement = document.getElementById("stalemate");
    stalemateElement.querySelector('p').textContent = `Draw by stalemate!`;
    centerDialogBox(stalemateElement);
  }

  const displayAbandonment = () => {
    let abandonmentElement = document.getElementById("abandonment");
    abandonmentElement.querySelector('p').textContent = `${getPlayerTurn() === "white" ? "Black" : "White"} wins by abandonment!` 
    centerDialogBox(abandonmentElement);
  }

  const displayTimeout = () => {
    let timeoutElement = document.getElementById("timeout");
    timeoutElement.querySelector('p').textContent = `${getPlayerTurn() === "white" ? "Black" : "White"} wins by timeout!` 
    centerDialogBox(timeoutElement);
  }

  const centerDialogBox = (dialogElement) => {
    // const boardRect = document.getElementById("chessboard").getBoundingClientRect();
    dialogElement.style.display = "flex";
    // dialogElement.style.position = "relative";
    // dialogElement.style.left = `${(boardRect.width - dialogElement.offsetWidth) / 2}px`;
    // dialogElement.style.top = `${(boardRect.height - dialogElement.offsetHeight) / 2}px`;
  }

  const dehighlightKingSquare = (kingLocation, kingOriginalLocation) => {
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

  const displayOpponentPromotion = (playerMoveInfo) => {
    let promotionSquareElement = getPiece(playerMoveInfo.move[1]);
    promotionSquareElement.innerHTML = playerMoveInfo.promotionPiece;
  }

  const updatePromotedPawnFEN = (move, piece_type) => {
    let colIndex = 0, pawnColIndex = move[1][1];
    if (move[1][0] === 0) {
      // find first backwards slash
      let i = 0;
      while (boardFEN[i] != '/') {
        if (colIndex === pawnColIndex) {
          boardFEN = boardFEN.substring(0, i) + piece_type + boardFEN.substring(i+1);
          break; // need to replace piece
        } 
        if (!isNaN(Number(boardFEN[i]))) {
          colIndex += Number(boardFEN[i]);
        } else {
          colIndex++;
        }
        i++;
      }
    } else {
      // find last backwards slash index and go until first space
      let i = boardFEN.lastIndexOf('/') + 1;
      while (boardFEN[i] != ' ') {
        if (colIndex === pawnColIndex) {
          boardFEN = boardFEN.substring(0, i) + piece_type + boardFEN.substring(i+1);
          console.log(boardFEN[i]);
          break;
        }
        if (!isNaN(Number(boardFEN[i]))) {
          colIndex += Number(boardFEN[i]);
        } else {
          colIndex++;
        }
        i++;
      }
    }
  } 

  const displayMessage = (message, isSentBySelf, username) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<span style="font-weight:bold;">${isSentBySelf ? "You" : username}</span>: ${message}`;
    const messages = document.getElementById("message-list");
    listItem.style.backgroundColor = messages.childElementCount % 2 === 1 ? "white" : "lightgrey";
    messages.appendChild(listItem);
    messages.scrollTop = messages.scrollHeight;
  }


  if (window.gameType === "sockets") {
    window.socket.on("displayMove", async playerMoveInfo => {
      console.log("displaying move!");
      let startSquareElement = getPiece(playerMoveInfo.move[0]);
      let endSquareElement = getPiece(playerMoveInfo.move[1]);
      await handleMove(playerMoveInfo, startSquareElement, endSquareElement);
    });
  }
  
}

  const pollSocketConnected = async () => {
    while (!window.socket.connected) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
  }

  const pollHasUserSelectedGameSettings = async () => {
    while (!hasUserSelectedGameSettings) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      })
    }
  }

const main = async () => {
  if (window.gameType === "sockets") {
    window.socket.on("startGame", async () => {
      try {
        await pollSocketConnected();
        await startGame();
      } catch (error) {
        console.error(`Error when starting online game: ${error}`);
      } finally {
        // end of promise chain
        console.log("game started!");
      }
    });
  } else {
    try {
      await pollHasUserSelectedGameSettings();
      await startGame();
    } catch (error) {
      console.error(`Error when starting local game: ${error}`);
    } finally {
      // end of promise chain
      console.log("game started!");
    }
  }
}

main();
