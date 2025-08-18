import type { TileProps } from "../../shared/types/chess"

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
  isGameOver,
  isDestinationTile
}: TileProps) {

  const handleClick: () => void = () => {
    console.log('clicked square: ', notation);
    if (isGameOver) {
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

  return (
    <div 
      className={`${notation} ${bgColor}`} 
      style={{ 
        backgroundColor: bgColor,
      }}
      onClick={handleClick}
    >
      {occupied && pieceOnTile && (
        <img src={`../../pieces/${pieceOnTile.color}${pieceOnTile.type}.png`} width={60} height={60}/>
      )}
      {isDestinationTile && (
        <img src={`../../target.png`} width={20} height={20}/>
      )}
    </div>
  )
}
