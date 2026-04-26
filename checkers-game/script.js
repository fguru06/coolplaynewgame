const BOARD_SIZE = 8;
const RED_DIRECTIONS = [[-1, -1], [-1, 1]];
const BLACK_DIRECTIONS = [[1, -1], [1, 1]];
const KING_DIRECTIONS = [...RED_DIRECTIONS, ...BLACK_DIRECTIONS];

const boardElement = document.getElementById("board");
const turnLabel = document.getElementById("turn-label");
const statusMessage = document.getElementById("status-message");
const redCount = document.getElementById("red-count");
const blackCount = document.getElementById("black-count");
const newGameButton = document.getElementById("new-game");

let board = [];
let currentPlayer = "red";
let selectedPiece = null;
let validMoves = [];
let winner = null;

function createInitialBoard() {
    return Array.from({ length: BOARD_SIZE }, (_, row) => {
        return Array.from({ length: BOARD_SIZE }, (_, col) => {
            if ((row + col) % 2 === 0) {
                return null;
            }

            if (row < 3) {
                return { color: "black", king: false };
            }

            if (row > 4) {
                return { color: "red", king: false };
            }

            return null;
        });
    });
}

function resetGame() {
    board = createInitialBoard();
    currentPlayer = "red";
    selectedPiece = null;
    validMoves = [];
    winner = null;
    statusMessage.textContent = "Red moves first. Captures are optional.";
    render();
}

function isInsideBoard(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getDirections(piece) {
    if (piece.king) {
        return KING_DIRECTIONS;
    }

    return piece.color === "red" ? RED_DIRECTIONS : BLACK_DIRECTIONS;
}

function getMovesForPiece(row, col, state = board) {
    const piece = state[row][col];

    if (!piece) {
        return [];
    }

    const moves = [];

    for (const [rowStep, colStep] of getDirections(piece)) {
        const nextRow = row + rowStep;
        const nextCol = col + colStep;

        if (!isInsideBoard(nextRow, nextCol)) {
            continue;
        }

        const nextCell = state[nextRow][nextCol];

        if (!nextCell) {
            moves.push({ row: nextRow, col: nextCol, capture: null });
            continue;
        }

        if (nextCell.color === piece.color) {
            continue;
        }

        const jumpRow = nextRow + rowStep;
        const jumpCol = nextCol + colStep;

        if (!isInsideBoard(jumpRow, jumpCol) || state[jumpRow][jumpCol]) {
            continue;
        }

        moves.push({
            row: jumpRow,
            col: jumpCol,
            capture: { row: nextRow, col: nextCol }
        });
    }

    return moves;
}

function getAllMovesForPlayer(player, state = board) {
    const moves = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            const piece = state[row][col];

            if (!piece || piece.color !== player) {
                continue;
            }

            const pieceMoves = getMovesForPiece(row, col, state).map(move => ({
                from: { row, col },
                ...move
            }));

            moves.push(...pieceMoves);
        }
    }

    return moves;
}

function getRequiredCaptures(player, state = board) {
    return getAllMovesForPlayer(player, state).filter(move => Boolean(move.capture));
}

function cloneBoard(state) {
    return state.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

function maybePromote(piece, row) {
    if (piece.king) {
        return false;
    }

    if (piece.color === "red" && row === 0) {
        piece.king = true;
        return true;
    }

    if (piece.color === "black" && row === BOARD_SIZE - 1) {
        piece.king = true;
        return true;
    }

    return false;
}

function getValidMovesForSelection(row, col) {
    const piece = board[row][col];

    if (!piece || piece.color !== currentPlayer) {
        return [];
    }

    return getMovesForPiece(row, col);
}

function countPieces() {
    let red = 0;
    let black = 0;

    for (const row of board) {
        for (const piece of row) {
            if (!piece) {
                continue;
            }

            if (piece.color === "red") {
                red += 1;
            } else {
                black += 1;
            }
        }
    }

    return { red, black };
}

function switchPlayer() {
    currentPlayer = currentPlayer === "red" ? "black" : "red";
    selectedPiece = null;
    validMoves = [];
}

function updateGameStateAfterMove(movedToRow, movedToCol, wasCapture, wasPromoted) {
    const counts = countPieces();

    redCount.textContent = String(counts.red);
    blackCount.textContent = String(counts.black);

    if (counts.red === 0 || counts.black === 0) {
        winner = counts.red === 0 ? "Black" : "Red";
        statusMessage.textContent = winner + " wins by taking every piece.";
        return;
    }

    switchPlayer();

    const availableMoves = getAllMovesForPlayer(currentPlayer);
    if (availableMoves.length === 0) {
        winner = currentPlayer === "red" ? "Black" : "Red";
        statusMessage.textContent = winner + " wins. " + (currentPlayer === "red" ? "Red" : "Black") + " has no legal moves left.";
        return;
    }

    if (wasPromoted) {
        statusMessage.textContent = capitalize(currentPlayer) + " to move. The last move crowned a king.";
        return;
    }

    if (wasCapture) {
        statusMessage.textContent = capitalize(currentPlayer) + " to move. A piece was captured.";
        return;
    }

    statusMessage.textContent = capitalize(currentPlayer) + " to move.";
}

function movePiece(targetMove) {
    if (!selectedPiece || winner) {
        return;
    }

    const piece = board[selectedPiece.row][selectedPiece.col];
    board[selectedPiece.row][selectedPiece.col] = null;
    board[targetMove.row][targetMove.col] = piece;

    if (targetMove.capture) {
        board[targetMove.capture.row][targetMove.capture.col] = null;
    }

    const wasPromoted = maybePromote(piece, targetMove.row);
    updateGameStateAfterMove(targetMove.row, targetMove.col, Boolean(targetMove.capture), wasPromoted);
    render();
}

function handleCellClick(row, col) {
    if (winner) {
        return;
    }

    const clickedPiece = board[row][col];
    const move = validMoves.find(option => option.row === row && option.col === col);

    if (move) {
        movePiece(move);
        return;
    }

    if (!clickedPiece || clickedPiece.color !== currentPlayer) {
        return;
    }

    const moves = getValidMovesForSelection(row, col);

    if (moves.length === 0) {
        statusMessage.textContent = "That piece has no legal move right now.";
        return;
    }

    selectedPiece = { row, col };
    validMoves = moves;
    statusMessage.textContent = moves.some(option => option.capture)
        ? "Choose a destination square. Capture moves are highlighted too."
        : "Choose a destination square.";
    render();
}

function createPieceElement(piece) {
    const token = document.createElement("div");
    token.className = "piece " + piece.color + (piece.king ? " king" : "");
    token.setAttribute("aria-hidden", "true");
    return token;
}

function render() {
    boardElement.innerHTML = "";
    turnLabel.textContent = winner ? winner + " Wins" : capitalize(currentPlayer);

    const counts = countPieces();
    redCount.textContent = String(counts.red);
    blackCount.textContent = String(counts.black);

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            const cell = document.createElement("button");
            const isDark = (row + col) % 2 === 1;
            const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
            const move = validMoves.find(option => option.row === row && option.col === col);
            const piece = board[row][col];

            cell.type = "button";
            cell.className = "cell " + (isDark ? "dark" : "light");
            cell.setAttribute("role", "gridcell");
            cell.setAttribute("aria-label", "Row " + (row + 1) + " column " + (col + 1));

            if (isSelected) {
                cell.classList.add("selected");
            }

            if (move) {
                cell.classList.add(move.capture ? "capture" : "valid");
            }

            if (piece) {
                cell.appendChild(createPieceElement(piece));
            }

            cell.addEventListener("click", () => handleCellClick(row, col));
            boardElement.appendChild(cell);
        }
    }
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

newGameButton.addEventListener("click", resetGame);

resetGame();