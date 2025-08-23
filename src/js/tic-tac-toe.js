// Variables
const cells = document.getElementsByClassName("q");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const setupBtn = document.getElementById("setupBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const mode = localStorage.getItem("mode") || "pvp";
const storageKey = mode === "pvm" ? "pvm" : "pvp";

const difficulty = (localStorage.getItem("difficulty") || "easy").toLowerCase().trim();
const player1Name = localStorage.getItem("player1") || "Player1";
const player2Name = localStorage.getItem("player2") || "Player2";

const winConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let scoreDraws = 0;

// Iniciar juego
function startGame() {
    Array.from(cells).forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    setupBtn.addEventListener("click", backToSetup);
    resetScoreBtn.addEventListener("click", resetScore);

    scorePlayer1 = parseInt(localStorage.getItem(`scorePlayer1_${storageKey}`)) || 0;
    scorePlayer2 = parseInt(localStorage.getItem(`scorePlayer2_${storageKey}`)) || 0;
    scoreDraws   = parseInt(localStorage.getItem(`scoreDraw_${storageKey}`)) || 0;

    updateScoreboard();
    statusText.textContent = `${getCurrentPlayerName()}'s turn`;
}

startGame();

function cellClicked() {
    const cellIndex = this.getAttribute("cellIndex");

    if (!running || board[cellIndex] !== "") return;

    board[cellIndex] = currentPlayer;
    this.textContent = currentPlayer;

    if (checkWinner()) return;

    if (mode === "pvp") {
        changePlayer();
    } else if (mode === "pvm") {
        running = false;
        statusText.textContent = "Machine is thinking...";
        setTimeout(() => {
            machineMove();
            if (running) {
                statusText.textContent = `${getCurrentPlayerName()}'s turn`;
            }
        }, 500);
    }
}

function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${getCurrentPlayerName()}'s turn`;
}

function checkWinner() {
    for (let condition of winConditions) {
        const [a,b,c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            running = false;
            const winnerSymbol = board[a];
            let winnerName;
            if (winnerSymbol === "X") winnerName = player1Name;
            else winnerName = mode === "pvm" ? "Machine" : player2Name;

            statusText.textContent = `${winnerName} wins!`;
            condition.forEach(i => cells[i].classList.add("win"));

            if (winnerSymbol === "X") scorePlayer1++;
            else scorePlayer2++;

            updateScoreboard();
            return true;
        }
    }

    if (!board.includes("")) {
        running = false;
        statusText.textContent = "Draw!";
        scoreDraws++;
        updateScoreboard();
        return true;
    }
    return false;
}


// Scoreboard
function updateScoreboard() {
    document.getElementById("scoreP1").textContent = scorePlayer1;
    document.getElementById("scoreP2").textContent = scorePlayer2;
    document.getElementById("scoreDraws").textContent = scoreDraws;
    document.getElementById("player1Name").textContent = player1Name;
    document.getElementById("player2Name").textContent = mode === "pvm" ? "Machine" : player2Name;

    localStorage.setItem(`scorePlayer1_${storageKey}`, scorePlayer1);
    localStorage.setItem(`scorePlayer2_${storageKey}`, scorePlayer2);
    localStorage.setItem(`scoreDraw_${storageKey}`, scoreDraws);
}

function resetScore() {
    scorePlayer1 = scorePlayer2 = scoreDraws = 0;
    localStorage.removeItem(`scorePlayer1_${storageKey}`);
    localStorage.removeItem(`scorePlayer2_${storageKey}`);
    localStorage.removeItem(`scoreDraw_${storageKey}`);
    updateScoreboard();
}

// Turno de la máquina
function machineMove() {
    let move;

    switch(difficulty) {
        case "easy": move = getRandomMove(); break;
        case "medium": move = getMediumMove() ?? getRandomMove(); break;
        case "hard": move = getBestMoveMinimax(); break;
        default: move = getRandomMove();
    }

    if (move !== undefined) {
        board[move] = "O";
        cells[move].textContent = "O";
        if (checkWinner()) return;
    }

    running = true;
}

// IA fácil
function getRandomMove() {
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

// IA media
function getMediumMove() {
    return findBestMove("O") ?? findBestMove("X");
}

function findBestMove(player) {
    for (let condition of winConditions) {
        const [a,b,c] = condition;
        const line = [board[a], board[b], board[c]];
        if (line.filter(v=>v===player).length===2 && line.includes("")) {
            return condition[line.indexOf("")];
        }
    }
    return null;
}

// IA difícil - Minimax
function getBestMoveMinimax() {
    let bestScore = -Infinity;
    let move = -1;
    for (let i=0;i<board.length;i++) {
        if (board[i]==="") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(b, depth, isMax) {
    const result = evaluate(b);
    if (result !== null) return result - depth;

    if (isMax) {
        let best = -Infinity;
        for (let i=0;i<b.length;i++) {
            if (b[i]==="") {
                b[i]="O";
                best = Math.max(best, minimax(b, depth+1, false));
                b[i]="";
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i=0;i<b.length;i++) {
            if (b[i]==="") {
                b[i]="X";
                best = Math.min(best, minimax(b, depth+1, true));
                b[i]="";
            }
        }
        return best;
    }
}

function evaluate(b) {
    for (let condition of winConditions) {
        const [a,b1,c] = condition;
        if (b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a]==="O"?10:-10;
    }
    if (!b.includes("")) return 0;
    return null;
}

function getCurrentPlayerName() {
    if (mode==="pvm" && currentPlayer==="O") return "Machine";
    return currentPlayer==="X"?player1Name:player2Name;
}

// Reiniciar juego
function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    running = true;
    Array.from(cells).forEach(c => {
        c.textContent = "";
        c.classList.remove("win");
    });
    statusText.textContent = `${getCurrentPlayerName()}'s turn`;
}

// Regresar a setup
function backToSetup() {
    window.location.href = "index.html";
}
