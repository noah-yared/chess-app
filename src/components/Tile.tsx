import type { TileProps } from "../../shared/types/chess";
import emptyTargetIcon from '../assets/target.png';
import occupiedTargetIcon from '../assets/occupied-target.png';
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

const pieceIcons: Record<string, string> = {
  wp, wn, wb, wr, wq, wk,
  bp, bn, bb, br, bq, bk,
};

export default function Tile({
  notation,
  occupied,
  pieceOnTile,
  bgColor,
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
  
  return (
    <div 
      className={`${notation} ${bgColor} ${isCheckedKing ? 'checked-king' : ''}`} 
      style={{ backgroundColor: (!isCheckedKing ? bgColor : undefined) }}
      onClick={handleClick}
    >
      {occupied && pieceOnTile && (
        <img src={pieceIcons[`${pieceOnTile.color}${pieceOnTile.type}`]} width="80%" height="80%" className="piece-icon" /> 
      )}
      {isDestinationTile && !occupied && (
        <img src={emptyTargetIcon} className="target-icon" id="empty" />
      )}
      {isDestinationTile && occupied && (
        <img src={occupiedTargetIcon} className="target-icon" id="occupied" />
      )}
    </div>
  )
}
