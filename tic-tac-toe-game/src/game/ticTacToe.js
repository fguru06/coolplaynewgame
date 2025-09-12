class TicTacToe {
    constructor() {
        this.board = [['', '', ''], ['', '', ''], ['', '', '']];
        this.currentPlayer = 'X'; // X starts first
        this.winner = null;
    }

    startGame() {
        this.resetGame();
    }

    makeMove(row, col) {
        if (this.board[row][col] === '' && this.winner === null) {
            this.board[row][col] = this.currentPlayer;
            if (this.checkWinner()) {
                return true; // Move resulted in a win
            }
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X'; // Switch player
            return false; // Move was successful but no winner yet
        }
        return false; // Invalid move
    }

    checkWinner() {
        const winningCombinations = [
            // Horizontal
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            // Vertical
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            // Diagonal
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]],
        ];

        for (const combination of winningCombinations) {
            const [[a, b], [c, d], [e, f]] = combination;
            if (this.board[a][b] && this.board[a][b] === this.board[c][d] && this.board[a][b] === this.board[e][f]) {
                this.winner = this.board[a][b];
                return true;
            }
        }
        return false;
    }

    resetGame() {
        this.board = [['', '', ''], ['', '', ''], ['', '', '']];
        this.currentPlayer = 'X';
        this.winner = null;
    }

    isBoardFull() {
        return this.board.every(row => row.every(cell => cell !== ''));
    }
    getBoard() {
        return this.board;
    }
    isPlayerTurn() {
        return this.currentPlayer === 'X';
    }
    getWinner() {
        return this.winner;
    }
    // Add other methods as needed (getBoard, isBoardFull, isPlayerTurn, getWinner, resetGame)
}

module.exports = { TicTacToe };
