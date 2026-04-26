const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const BACK_ROW = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
const PIECE_SYMBOLS = {
    white: {
        king: "\u2654",
        queen: "\u2655",
        rook: "\u2656",
        bishop: "\u2657",
        knight: "\u2658",
        pawn: "\u2659"
    },
    black: {
        king: "\u265A",
        queen: "\u265B",
        rook: "\u265C",
        bishop: "\u265D",
        knight: "\u265E",
        pawn: "\u265F"
    }
};
const PIECE_NAMES = {
    king: "King",
    queen: "Queen",
    rook: "Rook",
    bishop: "Bishop",
    knight: "Knight",
    pawn: "Pawn"
};

const elements = {
    board: document.getElementById("board"),
    turnIndicator: document.getElementById("turn-indicator"),
    statusPill: document.getElementById("status-pill"),
    statusText: document.getElementById("status-text"),
    capturedWhite: document.getElementById("captured-white"),
    capturedBlack: document.getElementById("captured-black"),
    moveList: document.getElementById("move-list"),
    moveCount: document.getElementById("move-count"),
    resetBtn: document.getElementById("reset-btn"),
    undoBtn: document.getElementById("undo-btn"),
    promotionModal: document.getElementById("promotion-modal"),
    promotionOptions: document.getElementById("promotion-options")
};

const pieceImageCache = new Map();
const undoStack = [];
let state = createInitialState();

elements.resetBtn.addEventListener("click", resetGame);
elements.undoBtn.addEventListener("click", undoMove);

render();

function createInitialState() {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let col = 0; col < 8; col += 1) {
        board[0][col] = createPiece(BACK_ROW[col], "black");
        board[1][col] = createPiece("pawn", "black");
        board[6][col] = createPiece("pawn", "white");
        board[7][col] = createPiece(BACK_ROW[col], "white");
    }

    return {
        board,
        currentPlayer: "white",
        selected: null,
        legalMoves: [],
        pendingPromotion: null,
        enPassant: null,
        history: [],
        capturedByWhite: [],
        capturedByBlack: [],
        result: null,
        message: "Select a piece to see its legal moves."
    };
}

function createPiece(type, color) {
    return { type, color, hasMoved: false };
}

function resetGame() {
    undoStack.length = 0;
    state = createInitialState();
    render();
}

function undoMove() {
    if (!undoStack.length) {
        state.message = "No move to undo yet.";
        render();
        return;
    }

    state = undoStack.pop();
    state.message = "Undid the previous move.";
    render();
}

function render() {
    renderBoard();
    renderStatus();
    renderCaptured();
    renderMoveHistory();
    renderPromotionChoices();
}

function renderBoard() {
    elements.board.innerHTML = "";
    const checkedKing = getCheckedKingSquare(state);

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const square = document.createElement("button");
            const piece = state.board[row][col];
            const isDark = (row + col) % 2 === 1;
            const isSelected = state.selected && state.selected.row === row && state.selected.col === col;
            const matchingMove = state.legalMoves.find((move) => move.toRow === row && move.toCol === col);

            square.type = "button";
            square.className = `square ${isDark ? "dark" : "light"}`;
            square.setAttribute("role", "gridcell");
            square.setAttribute("aria-label", describeSquare(row, col, piece));

            if (isSelected) {
                square.classList.add("selected");
            }

            if (matchingMove) {
                square.classList.add(matchingMove.capture ? "capture" : "legal");
            }

            if (checkedKing && checkedKing.row === row && checkedKing.col === col) {
                square.classList.add("king-in-check");
            }

            square.addEventListener("click", () => handleSquareClick(row, col));

            if (piece) {
                const image = document.createElement("img");
                image.src = getPieceImage(piece);
                image.alt = `${capitalize(piece.color)} ${PIECE_NAMES[piece.type]}`;
                image.className = "piece-image";
                square.appendChild(image);
            }

            elements.board.appendChild(square);
        }
    }
}

function renderStatus() {
    const playerName = capitalize(state.currentPlayer);
    elements.turnIndicator.textContent = state.result ? state.result.title : `${playerName} to move`;
    elements.statusPill.textContent = state.result ? state.result.pill : getStatusPillText();
    elements.statusText.textContent = state.message;
    elements.undoBtn.disabled = undoStack.length === 0 || Boolean(state.pendingPromotion);
}

function renderCaptured() {
    renderCapturedStrip(elements.capturedWhite, state.capturedByWhite);
    renderCapturedStrip(elements.capturedBlack, state.capturedByBlack);
}

function renderCapturedStrip(container, pieces) {
    container.innerHTML = "";

    if (!pieces.length) {
        const empty = document.createElement("span");
        empty.textContent = "None";
        container.appendChild(empty);
        return;
    }

    pieces.forEach((piece) => {
        const image = document.createElement("img");
        image.src = getPieceImage(piece);
        image.alt = `${capitalize(piece.color)} ${PIECE_NAMES[piece.type]}`;
        image.className = "captured-token";
        container.appendChild(image);
    });
}

function renderMoveHistory() {
    elements.moveList.innerHTML = "";

    state.history.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = entry;
        elements.moveList.appendChild(item);
    });

    const label = state.history.length === 1 ? "move" : "moves";
    elements.moveCount.textContent = `${state.history.length} ${label}`;
}

function renderPromotionChoices() {
    if (!state.pendingPromotion) {
        elements.promotionModal.classList.add("hidden");
        elements.promotionModal.setAttribute("aria-hidden", "true");
        elements.promotionOptions.innerHTML = "";
        return;
    }

    elements.promotionModal.classList.remove("hidden");
    elements.promotionModal.setAttribute("aria-hidden", "false");
    elements.promotionOptions.innerHTML = "";

    ["queen", "rook", "bishop", "knight"].forEach((type) => {
        const button = document.createElement("button");
        const image = document.createElement("img");
        const label = document.createElement("span");

        button.type = "button";
        button.className = "promotion-btn";
        button.addEventListener("click", () => completePromotion(type));

        image.src = getPieceImage({ type, color: state.pendingPromotion.color });
        image.alt = `${capitalize(state.pendingPromotion.color)} ${PIECE_NAMES[type]}`;
        label.textContent = PIECE_NAMES[type];

        button.appendChild(image);
        button.appendChild(label);
        elements.promotionOptions.appendChild(button);
    });
}

function handleSquareClick(row, col) {
    if (state.pendingPromotion || state.result) {
        return;
    }

    const piece = state.board[row][col];
    const move = state.legalMoves.find((candidate) => candidate.toRow === row && candidate.toCol === col);

    if (move && state.selected) {
        commitMove(move);
        return;
    }

    if (!piece) {
        state.selected = null;
        state.legalMoves = [];
        state.message = "Select one of your pieces to move.";
        render();
        return;
    }

    if (piece.color !== state.currentPlayer) {
        state.message = `It is ${capitalize(state.currentPlayer)}'s turn.`;
        render();
        return;
    }

    if (state.selected && state.selected.row === row && state.selected.col === col) {
        state.selected = null;
        state.legalMoves = [];
        state.message = "Selection cleared.";
        render();
        return;
    }

    const legalMoves = getLegalMovesForPiece(state, row, col);
    state.selected = { row, col };
    state.legalMoves = legalMoves;
    state.message = legalMoves.length
        ? `${capitalize(piece.color)} ${PIECE_NAMES[piece.type]} selected.`
        : `${capitalize(piece.color)} ${PIECE_NAMES[piece.type]} has no legal moves.`;
    render();
}

function commitMove(move) {
    undoStack.push(cloneState(state));
    applyMove(state, move, { simulation: false });

    state.selected = null;
    state.legalMoves = [];

    const movedPiece = state.board[move.toRow][move.toCol];
    if (movedPiece && movedPiece.type === "pawn" && (move.toRow === 0 || move.toRow === 7)) {
        state.pendingPromotion = {
            row: move.toRow,
            col: move.toCol,
            color: movedPiece.color,
            notationBase: move.notationBase,
            checkSuffix: move.checkSuffix
        };
        state.message = `${capitalize(movedPiece.color)} pawn reached the last rank. Choose a promotion piece.`;
        render();
        return;
    }

    finalizeTurn(move.notationBase + move.checkSuffix);
}

function completePromotion(type) {
    const { row, col, color, notationBase, checkSuffix } = state.pendingPromotion;
    state.board[row][col] = {
        type,
        color,
        hasMoved: true
    };
    state.pendingPromotion = null;
    finalizeTurn(`${notationBase}=${notationLetter(type)}${checkSuffix}`);
}

function finalizeTurn(notation) {
    state.history.push(notation);
    state.currentPlayer = state.currentPlayer === "white" ? "black" : "white";

    const availableMoves = getAllLegalMoves(state, state.currentPlayer);
    const inCheck = isKingInCheck(state, state.currentPlayer);

    if (!availableMoves.length && inCheck) {
        const winner = state.currentPlayer === "white" ? "Black" : "White";
        state.result = {
            title: `${winner} wins`,
            pill: "Checkmate"
        };
        state.message = `Checkmate. ${winner} wins the game.`;
    } else if (!availableMoves.length) {
        state.result = {
            title: "Draw",
            pill: "Stalemate"
        };
        state.message = "Stalemate. No legal moves remain.";
    } else if (inCheck) {
        state.result = null;
        state.message = `${capitalize(state.currentPlayer)} is in check.`;
    } else {
        state.result = null;
        state.message = `It is ${capitalize(state.currentPlayer)}'s turn.`;
    }

    render();
}

function getStatusPillText() {
    if (state.pendingPromotion) {
        return "Promotion";
    }

    if (isKingInCheck(state, state.currentPlayer)) {
        return "Check";
    }

    return "Match in progress";
}

function getLegalMovesForPiece(currentState, row, col) {
    const piece = currentState.board[row][col];
    if (!piece || piece.color !== currentState.currentPlayer) {
        return [];
    }

    const pseudoMoves = getPseudoMoves(currentState, row, col, false);

    return pseudoMoves
        .filter((move) => {
            const simulated = cloneState(currentState);
            applyMove(simulated, move, { simulation: true, promotionType: "queen" });
            return !isKingInCheck(simulated, piece.color);
        })
        .map((move) => enrichMoveNotation(currentState, move, piece));
}

function getAllLegalMoves(currentState, color) {
    const moves = [];

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const piece = currentState.board[row][col];
            if (!piece || piece.color !== color) {
                continue;
            }

            const pseudoMoves = getPseudoMoves(currentState, row, col, false);
            pseudoMoves.forEach((move) => {
                const simulated = cloneState(currentState);
                applyMove(simulated, move, { simulation: true, promotionType: "queen" });
                if (!isKingInCheck(simulated, color)) {
                    moves.push(move);
                }
            });
        }
    }

    return moves;
}

function getPseudoMoves(currentState, row, col, attackOnly) {
    const piece = currentState.board[row][col];
    if (!piece) {
        return [];
    }

    switch (piece.type) {
        case "pawn":
            return getPawnMoves(currentState, row, col, attackOnly);
        case "knight":
            return getKnightMoves(currentState, row, col);
        case "bishop":
            return getSlidingMoves(currentState, row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
        case "rook":
            return getSlidingMoves(currentState, row, col, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
        case "queen":
            return getSlidingMoves(currentState, row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]);
        case "king":
            return getKingMoves(currentState, row, col, attackOnly);
        default:
            return [];
    }
}

function getPawnMoves(currentState, row, col, attackOnly) {
    const piece = currentState.board[row][col];
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;
    const moves = [];

    [[direction, -1], [direction, 1]].forEach(([rowDelta, colDelta]) => {
        const targetRow = row + rowDelta;
        const targetCol = col + colDelta;
        if (!isInsideBoard(targetRow, targetCol)) {
            return;
        }

        const occupant = currentState.board[targetRow][targetCol];
        if (attackOnly) {
            moves.push({ fromRow: row, fromCol: col, toRow: targetRow, toCol: targetCol, capture: Boolean(occupant) });
            return;
        }

        if (occupant && occupant.color !== piece.color) {
            moves.push({ fromRow: row, fromCol: col, toRow: targetRow, toCol: targetCol, capture: true });
            return;
        }

        if (currentState.enPassant && currentState.enPassant.row === targetRow && currentState.enPassant.col === targetCol) {
            moves.push({
                fromRow: row,
                fromCol: col,
                toRow: targetRow,
                toCol: targetCol,
                capture: true,
                enPassant: true,
                capturedRow: currentState.enPassant.capturedRow,
                capturedCol: currentState.enPassant.capturedCol
            });
        }
    });

    if (attackOnly) {
        return moves;
    }

    const oneStepRow = row + direction;
    if (isInsideBoard(oneStepRow, col) && !currentState.board[oneStepRow][col]) {
        moves.push({ fromRow: row, fromCol: col, toRow: oneStepRow, toCol: col, capture: false });

        const twoStepRow = row + direction * 2;
        if (row === startRow && !currentState.board[twoStepRow][col]) {
            moves.push({
                fromRow: row,
                fromCol: col,
                toRow: twoStepRow,
                toCol: col,
                capture: false,
                doubleStep: true
            });
        }
    }

    return moves;
}

function getKnightMoves(currentState, row, col) {
    const piece = currentState.board[row][col];
    const moves = [];
    const offsets = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];

    offsets.forEach(([rowDelta, colDelta]) => {
        const targetRow = row + rowDelta;
        const targetCol = col + colDelta;
        if (!isInsideBoard(targetRow, targetCol)) {
            return;
        }

        const occupant = currentState.board[targetRow][targetCol];
        if (!occupant || occupant.color !== piece.color) {
            moves.push({ fromRow: row, fromCol: col, toRow: targetRow, toCol: targetCol, capture: Boolean(occupant) });
        }
    });

    return moves;
}

function getSlidingMoves(currentState, row, col, directions) {
    const piece = currentState.board[row][col];
    const moves = [];

    directions.forEach(([rowDelta, colDelta]) => {
        let targetRow = row + rowDelta;
        let targetCol = col + colDelta;

        while (isInsideBoard(targetRow, targetCol)) {
            const occupant = currentState.board[targetRow][targetCol];
            if (!occupant) {
                moves.push({ fromRow: row, fromCol: col, toRow: targetRow, toCol: targetCol, capture: false });
            } else {
                if (occupant.color !== piece.color) {
                    moves.push({ fromRow: row, fromCol: col, toRow: targetRow, toCol: targetCol, capture: true });
                }
                break;
            }

            targetRow += rowDelta;
            targetCol += colDelta;
        }
    });

    return moves;
}

function getKingMoves(currentState, row, col, attackOnly) {
    const piece = currentState.board[row][col];
    const moves = [];

    for (let rowDelta = -1; rowDelta <= 1; rowDelta += 1) {
        for (let colDelta = -1; colDelta <= 1; colDelta += 1) {
            if (rowDelta === 0 && colDelta === 0) {
                continue;
            }

            const targetRow = row + rowDelta;
            const targetCol = col + colDelta;
            if (!isInsideBoard(targetRow, targetCol)) {
                continue;
            }

            const occupant = currentState.board[targetRow][targetCol];
            if (!occupant || occupant.color !== piece.color) {
                moves.push({ fromRow: row, fromCol: col, toRow: targetRow, toCol: targetCol, capture: Boolean(occupant) });
            }
        }
    }

    if (attackOnly || piece.hasMoved || isKingInCheck(currentState, piece.color)) {
        return moves;
    }

    const enemyColor = piece.color === "white" ? "black" : "white";
    const castleChecks = [
        {
            side: "king",
            rookCol: 7,
            throughCols: [5, 6],
            emptyCols: [5, 6],
            destinationCol: 6
        },
        {
            side: "queen",
            rookCol: 0,
            throughCols: [3, 2],
            emptyCols: [1, 2, 3],
            destinationCol: 2
        }
    ];

    castleChecks.forEach((castle) => {
        const rook = currentState.board[row][castle.rookCol];
        if (!rook || rook.type !== "rook" || rook.color !== piece.color || rook.hasMoved) {
            return;
        }

        const pathIsClear = castle.emptyCols.every((pathCol) => !currentState.board[row][pathCol]);
        if (!pathIsClear) {
            return;
        }

        const safeSquares = [col, ...castle.throughCols].every((safeCol) => !isSquareAttacked(currentState, row, safeCol, enemyColor));
        if (!safeSquares) {
            return;
        }

        moves.push({
            fromRow: row,
            fromCol: col,
            toRow: row,
            toCol: castle.destinationCol,
            capture: false,
            castle: castle.side
        });
    });

    return moves;
}

function applyMove(currentState, move, options) {
    const { simulation, promotionType } = options;
    const piece = currentState.board[move.fromRow][move.fromCol];
    let capturedPiece = null;

    currentState.enPassant = null;

    if (move.enPassant) {
        capturedPiece = currentState.board[move.capturedRow][move.capturedCol];
        currentState.board[move.capturedRow][move.capturedCol] = null;
    } else {
        capturedPiece = currentState.board[move.toRow][move.toCol];
    }

    currentState.board[move.toRow][move.toCol] = {
        ...piece,
        hasMoved: true
    };
    currentState.board[move.fromRow][move.fromCol] = null;

    if (move.castle) {
        const rookFromCol = move.castle === "king" ? 7 : 0;
        const rookToCol = move.castle === "king" ? 5 : 3;
        const rook = currentState.board[move.toRow][rookFromCol];
        currentState.board[move.toRow][rookToCol] = {
            ...rook,
            hasMoved: true
        };
        currentState.board[move.toRow][rookFromCol] = null;
    }

    if (piece.type === "pawn" && Math.abs(move.toRow - move.fromRow) === 2) {
        currentState.enPassant = {
            row: (move.fromRow + move.toRow) / 2,
            col: move.fromCol,
            capturedRow: move.toRow,
            capturedCol: move.toCol
        };
    }

    if (piece.type === "pawn" && (move.toRow === 0 || move.toRow === 7) && (simulation || promotionType)) {
        currentState.board[move.toRow][move.toCol] = {
            type: promotionType || "queen",
            color: piece.color,
            hasMoved: true
        };
    }

    if (!simulation && capturedPiece) {
        if (piece.color === "white") {
            currentState.capturedByWhite.push({ ...capturedPiece });
        } else {
            currentState.capturedByBlack.push({ ...capturedPiece });
        }
    }
}

function enrichMoveNotation(currentState, move, piece) {
    const notationBase = getNotationBase(move, piece);
    const simulated = cloneState(currentState);
    applyMove(simulated, move, { simulation: true, promotionType: "queen" });
    simulated.currentPlayer = piece.color === "white" ? "black" : "white";
    const opponentColor = simulated.currentPlayer;
    const opponentMoves = getAllLegalMoves(simulated, opponentColor);
    const opponentInCheck = isKingInCheck(simulated, opponentColor);

    let checkSuffix = "";
    if (opponentInCheck && !opponentMoves.length) {
        checkSuffix = "#";
    } else if (opponentInCheck) {
        checkSuffix = "+";
    }

    return {
        ...move,
        notationBase,
        checkSuffix
    };
}

function getNotationBase(move, piece) {
    if (move.castle === "king") {
        return "O-O";
    }

    if (move.castle === "queen") {
        return "O-O-O";
    }

    const destination = `${FILES[move.toCol]}${8 - move.toRow}`;
    const captureMark = move.capture ? "x" : "-";

    if (piece.type === "pawn") {
        const fromFile = FILES[move.fromCol];
        return move.capture
            ? `${fromFile}${captureMark}${destination}`
            : destination;
    }

    return `${notationLetter(piece.type)}${captureMark}${destination}`;
}

function notationLetter(type) {
    switch (type) {
        case "king":
            return "K";
        case "queen":
            return "Q";
        case "rook":
            return "R";
        case "bishop":
            return "B";
        case "knight":
            return "N";
        default:
            return "";
    }
}

function isKingInCheck(currentState, color) {
    const kingSquare = findKing(currentState.board, color);
    if (!kingSquare) {
        return false;
    }

    const enemyColor = color === "white" ? "black" : "white";
    return isSquareAttacked(currentState, kingSquare.row, kingSquare.col, enemyColor);
}

function getCheckedKingSquare(currentState) {
    const whiteInCheck = isKingInCheck(currentState, "white");
    if (whiteInCheck) {
        return findKing(currentState.board, "white");
    }

    const blackInCheck = isKingInCheck(currentState, "black");
    if (blackInCheck) {
        return findKing(currentState.board, "black");
    }

    return null;
}

function isSquareAttacked(currentState, row, col, byColor) {
    for (let boardRow = 0; boardRow < 8; boardRow += 1) {
        for (let boardCol = 0; boardCol < 8; boardCol += 1) {
            const piece = currentState.board[boardRow][boardCol];
            if (!piece || piece.color !== byColor) {
                continue;
            }

            const attackMoves = getPseudoMoves(currentState, boardRow, boardCol, true);
            if (attackMoves.some((move) => move.toRow === row && move.toCol === col)) {
                return true;
            }
        }
    }

    return false;
}

function findKing(board, color) {
    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const piece = board[row][col];
            if (piece && piece.color === color && piece.type === "king") {
                return { row, col };
            }
        }
    }

    return null;
}

function getPieceImage(piece) {
    const colorCode = piece.color === "white" ? "w" : "b";
    let typeCode = "";
    switch (piece.type) {
        case "king": typeCode = "K"; break;
        case "queen": typeCode = "Q"; break;
        case "rook": typeCode = "R"; break;
        case "bishop": typeCode = "B"; break;
        case "knight": typeCode = "N"; break;
        case "pawn": typeCode = "P"; break;
        default: typeCode = "";
    }

    return `images/pixel/${colorCode}${typeCode}.svg`;
}

function describeSquare(row, col, piece) {
    const coordinate = `${FILES[col]}${8 - row}`;
    if (!piece) {
        return `Empty square ${coordinate}`;
    }

    return `${capitalize(piece.color)} ${PIECE_NAMES[piece.type]} on ${coordinate}`;
}

function cloneState(currentState) {
    return {
        board: currentState.board.map((row) => row.map((piece) => piece ? { ...piece } : null)),
        currentPlayer: currentState.currentPlayer,
        selected: currentState.selected ? { ...currentState.selected } : null,
        legalMoves: currentState.legalMoves.map((move) => ({ ...move })),
        pendingPromotion: currentState.pendingPromotion ? { ...currentState.pendingPromotion } : null,
        enPassant: currentState.enPassant ? { ...currentState.enPassant } : null,
        history: [...currentState.history],
        capturedByWhite: currentState.capturedByWhite.map((piece) => ({ ...piece })),
        capturedByBlack: currentState.capturedByBlack.map((piece) => ({ ...piece })),
        result: currentState.result ? { ...currentState.result } : null,
        message: currentState.message
    };
}

function isInsideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}