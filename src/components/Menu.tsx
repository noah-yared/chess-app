import type { Color, Difficulty, MenuProps } from '../../shared/types/chess';
import gameStartSound from '../assets/game-start.mp3';

export default function Menu({
  engineSide,
  setEngineSide,
  difficulty,
  setDifficulty,
  isGameStarted,
  setIsGameStarted
} : MenuProps) {
  const opposite: (c: Color) => Color = (c) => c == 'w' ? 'b' : 'w';
  const genRandomSide: () => Color = () => (Math.random() < 0.5) ? 'w' : 'b';
  
  const assignSide: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (e.target.value == 'random')
      setEngineSide(genRandomSide());
    else
      setEngineSide(opposite(e.target.value as Color));
  }
  
  const assignDifficulty: React.ChangeEventHandler<HTMLSelectElement> = (e) => setDifficulty(e.target.value as Difficulty);

  return (
    <div className="menu-container">
      <h1 className="menu-title">Game Menu</h1>
      
      <div className="menu-form">
        <div className="form-group">
          <label htmlFor="side-select" className="form-label">
            Choose Side
          </label>
          <select 
            name="side" 
            id="side-select" 
            value={opposite(engineSide)} 
            onChange={assignSide} 
            disabled={isGameStarted}
            className="form-select"
          >
            <option value="w">White</option>
            <option value="b">Black</option>
            <option value="random">Random</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="difficulty-select" className="form-label">
            Choose Difficulty
          </label>
          <select 
            name="difficulty" 
            id="difficulty-select" 
            value={difficulty} 
            onChange={assignDifficulty} 
            disabled={isGameStarted}
            className="form-select"
          >
            <option value="beginner">Beginner</option>
            <option value="novice">Novice</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
            <option value="master">Master</option>
          </select>
        </div>

        <button 
          id='start-game-btn' 
          onClick={() => { setIsGameStarted(true); new Audio(gameStartSound).play(); }}
          disabled={isGameStarted}
          className="start-button"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}

