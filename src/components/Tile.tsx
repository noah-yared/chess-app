import type { TileProps } from "../../shared/types/chess";

import wp from '../assets/wp.svg';
import wn from '../assets/wn.svg';
import wb from '../assets/wb.svg';
import wr from '../assets/wr.svg';
import wq from '../assets/wq.svg';
import wk from '../assets/wk.svg';

import bp from '../assets/bp.svg';
import bn from '../assets/bn.svg';
import bb from '../assets/bb.svg';
import br from '../assets/br.svg';
import bq from '../assets/bq.svg';
import bk from '../assets/bk.svg';

const PIECE_ICONS = {
  wp, wn, wb, wr, wq, wk,
  bp, bn, bb, br, bq, bk,
};

const PIECE_NAMES = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export default function Tile({
  notation,
  pieceOnTile,
  isLightSquare,
  isLastMove,
  isSelected,
  firstSelectedTile,
  setFirstSelectedTile,
  secondSelectedTile,
  setSecondSelectedTile,
  turn,
  isCurrentKingInCheck,
  isGameOver,
  isDestinationTile,
  isGameStarted,
  engineSide,
  viewingOldHalfmove
}: TileProps) {
  const occupied = pieceOnTile !== null;

  const handleClick: () => void = () => {
    console.log('clicked square: ', notation);
    if (!isGameStarted || viewingOldHalfmove || isGameOver || turn === engineSide) {
      return;
    }
    if (firstSelectedTile === notation) {
      return setFirstSelectedTile(null);
    }
    if (firstSelectedTile === null) {
      if (occupied && pieceOnTile?.color === turn) {
        setFirstSelectedTile(notation);
      }
      return;
    }
    if (secondSelectedTile === null) {
      if (pieceOnTile?.color !== turn) {
        return setSecondSelectedTile(notation);
      }
    }
    setFirstSelectedTile(notation);
    setSecondSelectedTile(null);
  };

  const isCheckedKing = isCurrentKingInCheck && pieceOnTile?.type === 'k' && pieceOnTile?.color === turn;
  const className = [
    'chess-square',
    isLightSquare ? 'light' : 'dark',
    isLastMove ? 'last-move' : '',
    isSelected ? 'selected' : '',
    isDestinationTile ? 'legal-target' : '',
    isDestinationTile && occupied ? 'occupied-target' : '',
    isCheckedKing ? 'checked-king' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-label={`Square ${notation}`}
    >
      {occupied && pieceOnTile && (
        <img
          src={PIECE_ICONS[`${pieceOnTile.color}${pieceOnTile.type}`]}
          className="chess-piece"
          alt={`${pieceOnTile.color === 'w' ? 'White' : 'Black'} ${PIECE_NAMES[pieceOnTile.type]}`}
          draggable={false}
        />
      )}
      {isDestinationTile && <span className="legal-move-indicator" aria-hidden="true" />}
    </button>
  )
}
