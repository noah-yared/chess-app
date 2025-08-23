import type { Color, MoveList, Piece, Promotion, Square } from "../../shared/types/chess";
import { Client } from "./client";
import { EngineAPI } from "./engineApi";
import { fenToBoard } from "../utils/helpers";

function displayPromotionModal(from: Square, to: Square, turn: Color, setPromo: (promo: Promotion) => void): void {
  // TODO: Implement modal (logging for now, to avoid unused param warning)
  console.log(`displaying promotion modal for move from ${from} to ${to} on ${turn}'s turn`);
  setPromo('q'); // T
}

async function handlePromotion(from: Square, to: Square, turn: Color): Promise<Promotion> {
  // show a modal to select a promotion
  let promotionPiece: Promotion | undefined = undefined;
  displayPromotionModal(from, to, turn, (promo: Promotion) => { promotionPiece = promo; });
  // return the selected promotion piece
  return promotionPiece!;
}

export async function handlePlayerMove(
  fen: string,
  setFen: (fen: string) => void,
  setBoard: (board: (Piece | null)[][]) => void,
  from: Square,
  to: Square,
  setHighlightedTiles: (highlightedTiles: {from: Square, to: Square} | null) => void,
  setIsCurrentKingInCheck: (isCurrentKingInCheck: boolean) => void,
  turn: Color,
  setTurn: (turn: Color) => void,
  setIsGameOver: (isGameOver: boolean) => void,
  validPlayerMoves: React.RefObject<MoveList>
): Promise<void> {
  // return if move is invalid
  console.log('validPlayerMoves', validPlayerMoves.current);
  const matchingEntry = validPlayerMoves.current.get(from)?.find((other) => other.to === to);
  if (!matchingEntry) {
    return console.log('Invalid move');
  }

  const engine = new EngineAPI(new Client());
  const promo: Promotion | undefined = matchingEntry.promoting
    ? await handlePromotion(from, to, turn)
    : undefined;
  const [updatedFen, legalMoves] = await Promise.all([
    engine.updateFen(fen, {from, to, promo}),
    engine.getLegalMoves(fen),
  ]);
  const isKingInCheck = await engine.isKingInCheck(updatedFen);
  console.log('isKingInCheck=' + isKingInCheck);
  setIsCurrentKingInCheck(isKingInCheck);
  setFen(updatedFen);
  setBoard(fenToBoard(updatedFen))
  setTurn(turn === 'w' ? 'b' : 'w');
  setIsGameOver(legalMoves.size === 0);
  setHighlightedTiles({from, to});
  // update legal moves list
  validPlayerMoves.current = legalMoves;
  console.log('legalMoves', legalMoves);
  console.log('validPlayerMoves updated to:', validPlayerMoves.current);
}