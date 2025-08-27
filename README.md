# Chess Engine UI

A modern web-based chess interface built with React, TypeScript, and Vite, featuring a custom C++ chess engine backend.

## Features

- **Interactive Chessboard**: Click to move pieces with automatic legal move validation and highlighting
- **Custom Chess Engine**: Fast custom C++ engine backend (see [here](https://github.com/noah-yared/chess-engine/blob/main/README.md) for more details)
- **Game Menu**: Choose your side (White/Black/Random) and difficulty level before starting
- **Move History**: Browse through previous moves with interactive history navigation
- **Game State Persistence**: Automatic game state saving and restoration
- **Multiple Difficulty Levels**: From Beginner to Master
- **Sound Effects**: Audio feedback for game events (move sounds, check, game start/end)
- **Modern UI**: Clean, responsive interface with clear chess piece graphics

## Project Structure

```
chess_engine_ui/
├── engine/                # C++ chess engine
│   ├── src/               # Engine source code
│   ├── include/           # Header files
│   ├── tests/             # Engine tests
│   └── bench/             # Performance benchmarks
├── src/                   # React frontend
│   ├── components/        # React components
│   │   ├── Game.tsx       # Main game logic
│   │   ├── Chessboard.tsx # Interactive chessboard
│   │   ├── Menu.tsx       # Game setup menu
│   │   ├── History.tsx    # Move history component
│   │   ├── Logger.tsx     # Game status logger
│   │   └── Tile.tsx       # Individual board tiles
│   ├── utils/             # Utility functions
│   └── assets/            # Images and sound effects
├── server/                # Node.js backend
├── shared/                # Shared constants and types
│   ├── constants/         # Shared game constants
│   ├── types/             # Shared TypeScript types
└── public/                # Public assets
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS** for styling

### Backend
- **Node.js** with TypeScript
- **Express** server for API endpoints
- **Custom C++ Chess Engine** for game logic (see [here](https://github.com/noah-yared/chess-engine/blob/main/README.md) for more details)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Read [here](https://github.com/noah-yared/chess-engine/blob/main/README.md#prerequisites) for engine build prerequisites

### Installation

1. Clone the repository (with submodules):
```bash
git clone --recurse-submodules https://github.com/noah-yared/chess-app.git
cd chess-app

# if the above doesnt work (due to old version of git), try:
git clone https://github.com/noah-yared/chess-app.git
cd chess-app
git submodule update --init --recursive
```

2. Setup the project (install node dependencies, build engine and tests, optionally run tests, and install the engine binary to a local path):
```bash
npm run setup # may take ~1 minute as engine tests are run

# or if you want to skip the engine tests (for faster setup):
npm run setup:fast
```

3. Build and start the production server and frontend:
```bash
npm run build
npm run start
```

The application url should be printed to the console after running `npm run start`, likely defaults to `http://localhost:4173`.
