const { TicTacToe } = require('./game/ticTacToe');
const ComputerPlayer = require('./ai/computerPlayer');
const { displayBoard, getUserInput } = require('./ui/cli');

const game = new TicTacToe();
const computer = new ComputerPlayer('O');

const gameLoop = async () => {
    while (!game.checkWinner() && !game.isBoardFull()) {
        displayBoard(game.getBoard());

        let move;
        if (game.isPlayerTurn()) {
            // Ask for row and column separately
            console.log('Enter your move as row and column (e.g., 0 1 for row 0, col 1):');
            const input = await getUserInput();
            const [row, col] = input.toString().split(' ').map(Number);
            move = { row, col };
        } else {
            // Computer chooses a move
            const board = game.getBoard();
            let found = false;
            for (let r = 0; r < 3 && !found; r++) {
                for (let c = 0; c < 3 && !found; c++) {
                    if (board[r][c] === '') {
                        move = { row: r, col: c };
                        found = true;
                    }
                }
            }
        }
        game.makeMove(move.row, move.col);
    }

    displayBoard(game.getBoard());
    if (game.checkWinner()) {
        console.log(`Player ${game.getWinner()} wins!`);
    } else {
        console.log("It's a draw!");
    }
};

const startGame = () => {
    game.startGame();
    gameLoop();
};

startGame();
