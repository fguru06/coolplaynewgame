class TicTacToe {
    constructor() {
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.currentPlayer = 'X';
        this.winner = null;
    }

    makeMove(row, col) {
        if (this.board[row][col] === '' && !this.winner) {
            this.board[row][col] = this.currentPlayer;
            if (this.checkWinner()) {
                this.winner = this.currentPlayer;
            } else if (this.isBoardFull()) {
                this.winner = 'Draw';
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            }
            return true;
        }
        return false;
    }

    checkWinner() {
        const b = this.board;
        const lines = [
            // Rows
            [b[0][0], b[0][1], b[0][2]],
            [b[1][0], b[1][1], b[1][2]],
            [b[2][0], b[2][1], b[2][2]],
            // Columns
            [b[0][0], b[1][0], b[2][0]],
            [b[0][1], b[1][1], b[2][1]],
            [b[0][2], b[1][2], b[2][2]],
            // Diagonals
            [b[0][0], b[1][1], b[2][2]],
            [b[0][2], b[1][1], b[2][0]]
        ];
        return lines.some(line => line[0] && line[0] === line[1] && line[1] === line[2]);
    }

    isBoardFull() {
        return this.board.flat().every(cell => cell !== '');
    }

    resetGame() {
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.currentPlayer = 'X';
        this.winner = null;
    }
}

const game = new TicTacToe();
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const playerXScoreSpan = document.getElementById('playerXScore');
const playerOScoreSpan = document.getElementById('playerOScore');
let playerXScore = 0;
let playerOScore = 0;
let isCPU = null; // null = not chosen, false = friend, true = cpu opponent (plays as O)

// Mode buttons
const modeFriendBtn = document.getElementById('mode-friend');
const modeCpuBtn = document.getElementById('mode-cpu');
modeFriendBtn.addEventListener('click', () => setMode(false));
modeCpuBtn.addEventListener('click', () => setMode(true));
function setMode(cpu) {
    isCPU = cpu;
    if (isCPU) {
        modeFriendBtn.style.opacity = '0.7';
        modeCpuBtn.style.opacity = '1';
    } else {
        modeFriendBtn.style.opacity = '1';
        modeCpuBtn.style.opacity = '0.7';
    }
    // start/reset the game when a mode is chosen
    resetGame();
    // hide the opponent selection controls after choosing
    const sel = document.getElementById('opponent-select');
    if (sel) sel.style.display = 'none';
}

function renderBoard() {
    boardDiv.innerHTML = '';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = game.board[row][col];
            cell.onclick = () => handleCellClick(row, col);
            boardDiv.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    // Don't allow moves until opponent is chosen
    if (isCPU === null) return;
    // if CPU mode and it's O's turn, ignore human clicks
    if (isCPU && game.currentPlayer === 'O') return;
    if (game.winner || game.board[row][col] !== '') return;
    game.makeMove(row, col);
    updateStatus();
    renderBoard();
    updateScoreboard();

    // If CPU mode and game continues and it's O's turn, let CPU play
    if (isCPU && !game.winner && game.currentPlayer === 'O') {
        setTimeout(() => {
            makeCpuMove();
            updateStatus();
            renderBoard();
            updateScoreboard();
        }, 400);
    }
}

function makeCpuMove() {
    // simple random CPU: pick a random empty cell
    const empty = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (game.board[r][c] === '') empty.push([r, c]);
        }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    game.makeMove(r, c);
}

function updateStatus() {
    // If opponent not chosen yet, prompt the user and block play
    if (isCPU === null && !game.winner) {
        statusDiv.textContent = "Choose opponent: Friend or CPU";
        return;
    }
    if (game.winner === 'Draw') {
        statusDiv.textContent = "It's a draw!";
    } else if (game.winner) {
        statusDiv.textContent = `Player ${game.winner} wins!`;
        if (game.winner === 'X') {
            playerXScore++;
        } else if (game.winner === 'O') {
            playerOScore++;
        }
        showPartyPopper();
    } else {
        statusDiv.textContent = `Player ${game.currentPlayer}'s turn`;
    }
// Party popper animation
function showPartyPopper() {
    const popperContainer = document.getElementById('popper-container');
    const winAudio = document.getElementById('win-audio');
    if (winAudio) {
        winAudio.muted = false;
        winAudio.volume = 0.7;
        winAudio.currentTime = 0;
        winAudio.pause();
        winAudio.load();
        console.log('Attempting to play win audio...');
        winAudio.play().then(() => {
            console.log('Win audio played!');
        }).catch((err) => {
            console.warn('Audio playback failed:', err);
        });
    } else {
        console.warn('Win audio element not found!');
    }
    if (!popperContainer) return;
    for (let i = 0; i < 30; i++) {
        const popper = document.createElement('div');
        popper.style.position = 'absolute';
        popper.style.left = Math.random() * window.innerWidth + 'px';
        popper.style.top = (window.innerHeight / 2 + Math.random() * 100 - 50) + 'px';
        popper.style.width = '16px';
        popper.style.height = '16px';
        popper.style.borderRadius = '50%';
        popper.style.background = `hsl(${Math.random()*360},80%,60%)`;
        popper.style.opacity = '0.8';
        popper.style.zIndex = '10000';
        popper.style.pointerEvents = 'none';
        popper.style.transition = 'transform 1s cubic-bezier(.17,.67,.83,.67), opacity 1s';
        popperContainer.appendChild(popper);
        setTimeout(() => {
            popper.style.transform = `translateY(-${150 + Math.random()*100}px) scale(${0.5 + Math.random()})`;
            popper.style.opacity = '0';
        }, 50);
        setTimeout(() => {
            popper.remove();
        }, 1200);
    }
}
}

function resetGame() {
    game.resetGame();
    updateStatus();
    renderBoard();
    // Optionally reset scores here if you want scores to reset with the game
    // playerXScore = 0;
    // playerOScore = 0;
    // updateScoreboard();
}

// Initial render
renderBoard();
updateStatus();
updateScoreboard();

function updateScoreboard() {
    playerXScoreSpan.textContent = playerXScore;
    playerOScoreSpan.textContent = playerOScore;
}
window.resetGame = resetGame;
