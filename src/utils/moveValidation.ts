import type { Color, MoveList, Move, Promotion, Square } from "../../shared/types/chess";
import { Client } from "./client";
import { EngineAPI } from "./engineApi";

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

export async function processPlayerMove(
  from: Square,
  to: Square,
  turn: Color,
  validPlayerMoves: React.RefObject<MoveList>
): Promise< {move: Move, updatedFen: string, newLegalMoves: MoveList, isKingInCheck: boolean} | null> {
  // return if move is invalid
  const matchingEntry = validPlayerMoves.current.get(from)?.find((other) => other.to === to);
  if (!matchingEntry) {
    console.log('Invalid move');
    return null;
  }

  const promo: Promotion | undefined = matchingEntry.promoting
    ? await handlePromotion(from, to, turn)
    : undefined;

  const engine = new EngineAPI(new Client());
  const updatedFen = await engine.updateFen({ from, to, promo });
  const newLegalMoves = await engine.getLegalMoves();
  const isKingInCheck = await engine.isKingInCheck();

  return { move: { from, to, promo }, updatedFen, newLegalMoves, isKingInCheck };
}
