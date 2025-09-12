class ComputerPlayer {
    constructor(playerSymbol) {
        this.playerSymbol = playerSymbol;
    }

    chooseMove(board) {
        // Simple AI logic: choose the first available spot
        const availableMoves = board
            .map((value, index) => (value === '' ? index : null))
            .filter(index => index !== null);

        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
}

module.exports = ComputerPlayer;
