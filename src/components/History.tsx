import { useEffect, useState, useRef } from 'react';
import { fenToBoard, notateMove } from '../utils/helpers';
import { Client } from '../utils/client'
import { EngineAPI } from '../utils/engineApi';
import type { HistoryProps, Move } from '../../shared/types/chess';

export default function History({
  moveHistory,
  fenHistory,
  setIsGameOver,
  setIsKingInCheck,
  setBoard,
  setFen,
  setHighlightedTiles,
  halfmoveViewIndex,
  setHalfmoveViewIndex,
  setViewingOldHalfmove,
  setTurn,
  setFirstSelectedTile,
  setSecondSelectedTile
}: HistoryProps) {
  type FenInfo = { isKingInCheck: boolean, isGameOver: boolean };
  const [fenInfoCache, setFenInfoCache] = useState<Record<string, FenInfo>>({});

  const fenInfoCacheRef = useRef(fenInfoCache);
  const fenHistoryRef = useRef(fenHistory);

  // keep refs in sync with state
  useEffect(() => {
    fenHistoryRef.current = fenHistory;
    fenInfoCacheRef.current = fenInfoCache;
  }, [fenHistory, fenInfoCache]);

  useEffect(() => {
    const updateCacheInterval = setInterval(() => {
      const missingFens = fenHistoryRef.current.filter(fen => !fenInfoCacheRef.current[fen]);
      if (missingFens.length === 0) {
        return // cache is up to date
      }

      const fillCache = async () => {
        const engine = new EngineAPI(new Client());
        for (const fen of missingFens) {
          if (!fenInfoCacheRef.current[fen]) {
            setFenInfoCache({ ...fenInfoCacheRef.current, [fen]: await calculateFenInfo(fen, engine) });
          }
        }
      };
      fillCache();
    }, 300);
    return () => clearInterval(updateCacheInterval);
  }, []);

  const calculateFenInfo = async (fen: string, engine: EngineAPI) => {
    const [isKingInCheck, legalMoves] = await Promise.all([
      engine.isKingInCheck(fen),
      engine.getLegalMoves(fen)
    ])
    return {
      isKingInCheck,
      isGameOver: legalMoves.size === 0
    }
  }

  useEffect(() => {
    const handleHistoryJump = async (halfmoveIndex: number) => {
      const jumpingToLastMove = halfmoveIndex === moveHistory.length - 1;
      setHalfmoveViewIndex(halfmoveIndex);
      const updatedFen = fenHistory[halfmoveIndex+1];
      setFen(updatedFen);
      setBoard(fenToBoard(updatedFen));
      const { isKingInCheck, isGameOver } = await calculateFenInfo(updatedFen, new EngineAPI(new Client()));
      setIsKingInCheck(isKingInCheck);
      setIsGameOver(isGameOver);
      setTurn(halfmoveIndex % 2 === 0 ? 'b' : 'w');
      setHighlightedTiles(moveHistory[halfmoveIndex]);
      setFirstSelectedTile(null);
      setSecondSelectedTile(null);
      setViewingOldHalfmove(!jumpingToLastMove);
    }
    handleHistoryJump(halfmoveViewIndex);
  }, [halfmoveViewIndex]);


  const queryFenInfo: (fen: string) => FenInfo | null = (fen: string) => {
    const info = fenInfoCache[fen];
    return info ? info! : null;
  }

  const renderMove = (move: Move, index: number) => {
    const queryResult = queryFenInfo(fenHistory[index + 1]);
    if (queryResult === null)
      return "Loading...";
    return notateMove(move, fenToBoard(fenHistory[index]), queryResult);
  }

  const pairMoves = (moveHistory: Move[]) => {
    const fullMoves: ([Move, Move]|[Move])[] = [];
    for (let i = 0; i < Math.floor(moveHistory.length / 2); ++i)
      fullMoves.push([moveHistory[2*i], moveHistory[2*i+1]])
    if (moveHistory.length % 2 !== 0)
      fullMoves.push([moveHistory[moveHistory.length - 1]]);
    return fullMoves;
  }

  return (
    <div className='history-container'>
        {pairMoves(moveHistory)
          .map((fullmove, fullmoveIndex) => {
            const whiteHalfmoveIndex = 2 * fullmoveIndex;
            const blackHalfmoveIndex = 2 * fullmoveIndex + 1;
            return <div key={fullmoveIndex} className='full-move-box'>
              <span style={{ fontSize: '20px', textEmphasis: 'Highlight' }}>{`${fullmoveIndex + 1}. `}</span>
              <button onClick={() => setHalfmoveViewIndex(whiteHalfmoveIndex)}>
                {renderMove(fullmove[0], whiteHalfmoveIndex)}
              </button>
              {fullmove.length === 2 &&
                <button onClick={() => setHalfmoveViewIndex(blackHalfmoveIndex)}>
                {renderMove(fullmove[1], blackHalfmoveIndex)}
              </button>}
            </div>
          }) 
        }
    </div>
  );

}