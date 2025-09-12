# Tic Tac Toe Game

This is a simple Tic Tac Toe game that can be played against computer opponents. The game is implemented in TypeScript and provides a command-line interface for user interaction.

## Features

- Play against a computer opponent with basic AI.
- Command-line interface for easy interaction.
- Game state management with win condition checks.
- Easy to extend and modify.

## Getting Started

### Prerequisites

- Node.js (version 12 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd tic-tac-toe-game
   ```

3. Install the dependencies:
   ```
   npm install
   ```

### Running the Game

To start the game, run the following command:
```
npm start
```

### Game Instructions

- The game will prompt you to enter your move.
- You can enter your move by specifying the row and column (e.g., "1 2" for row 1, column 2).
- The computer will then make its move.
- The game continues until there is a winner or the game ends in a draw.

## Project Structure

```
tic-tac-toe-game
├── src
│   ├── main.ts          # Entry point of the application
│   ├── game
│   │   └── ticTacToe.ts # Game logic and state management
│   ├── ai
│   │   └── computerPlayer.ts # AI logic for computer opponent
│   ├── ui
│   │   └── cli.ts       # Command-line interface functions
│   └── types
│       └── index.ts     # Types and interfaces used in the project
├── package.json          # npm configuration file
├── tsconfig.json         # TypeScript configuration file
└── README.md             # Project documentation
```

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the game.