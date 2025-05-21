import { GAME_STATE } from "./game.js";

export const validateMove = async (move) => {
  console.log(`Validating ${move}`);
  const res = await fetch("http://localhost:5000/api/validate-move", {
    "method": "POST",
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }, 
    "body": JSON.stringify({
      "board": GAME_STATE.boardFEN,
      "move": move
    })
  });
  return await res.json();
}

export const identifyGameStateAfterPiecePromotion = async (kingLocation) => {
  const res = await fetch("http://localhost:5000/api/promotion-check", {
    "method": "POST",
    "headers": {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    "body": JSON.stringify({
      "fen": GAME_STATE.boardFEN,
      "king": kingLocation
    })
  });
  return await res.json();
}
