// Variables //
const cells = document.getElementsByClassName("q");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const setupBtn = document.getElementById("setupBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const mode = localStorage.getItem("mode") || "pvp";
const storageKey = (mode === "pvm") ? "pvm" : "pvp";

const difficulty = (localStorage.getItem("difficulty") || "easy").toLowerCase().trim();
const player1Name = localStorage.getItem("player1") ||"player1";
const player2Name = localStorage.getItem("player2") || "player2";

const winConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = false;
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let scoreDraws = 0;

// Iniciar juego //
startGame()

function startGame() {
    Array.from(cells).forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    setupBtn.addEventListener("click", backToSetup);
    resetScoreBtn.addEventListener("click", resetScore);

    scorePlayer1 = parseInt(localStorage.getItem(`scorePlayer1_${storageKey}`)) || 0;
    scorePlayer2 = parseInt(localStorage.getItem(`scorePlayer2_${storageKey}`)) || 0;
    scoreDraws   = parseInt(localStorage.getItem(`scoreDraw_${storageKey}`)) || 0;
    updateScoreboard()

    statusText.textContent = `${getCurrentPlayerName()}'s turn`;
    running = true;
}

// Jugadas //
function cellClicked() {
    const cellIndex = this.getAttribute("cellIndex");

    if (options[cellIndex] !== "" || !running || (mode === "pvm" && currentPlayer === "O")) return;

    updateCell(this, cellIndex);
    checkWinner();

    if(running && mode === "pvp") changePlayer();
    if (running && mode === "pvm") {
        currentPlayer === "O"
        statusText.textContent = "Machine is thinking...";
        setTimeout(machineMove, 1000);
    }
}

function updateCell(cell, i) {
    options[i] = currentPlayer;
    cell.textContent = currentPlayer;
}

function changePlayer() {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    statusText.textContent = `${getCurrentPlayerName()}'s turn`
}

function checkWinner() {
    let roundWon = false;
    let winningCells = [];

    for (let condition of winConditions) {
        const [a,b,c] = condition;
        if (options[a] && options[a] === options[b] && options[a] === options[c]) {
            roundWon = true;
            winningCells = [a,b,c];
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${getCurrentPlayerName()} wins!`;
        winningCells.forEach(i => cells[i].classList.add("win"));
        running = false;
        currentPlayer === "X" ? scorePlayer1++ : scorePlayer2++;
        updateScoreboard();
    } else if (!options.includes("")) {
        statusText.textContent = "Draw!";
        running = false;
        scoreDraws++;
        updateScoreboard();
    }
}

// Marcador //
function updateScoreboard()
    {
    document.getElementById("scoreP1").textContent = scorePlayer1;
    document.getElementById("scoreP2").textContent = scorePlayer2;
    document.getElementById("scoreDraws").textContent = scoreDraws;
    document.getElementById("player1Name").textContent = player1Name;
    document.getElementById("player2Name").textContent = (mode === "pvm")? "Machine" : player2Name;

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

// IA //
function machineMove() {
    switch(difficulty) {
        case "easy": randomMove(); break;
        case "medium": if(!mediumMove()) randomMove(); break;
        case "hard": bestMoveMinimax(); break;
        default: bestMoveMinimax();
    }
}

// Modo fácil //
function randomMove(){
    let emptyCells = [];
    for(let i=0;i<options.length;i++) if(options[i]==="") emptyCells.push(i);
    if(emptyCells.length===0) return;
    let move = emptyCells[Math.floor(Math.random()*emptyCells.length)];
    playMove(move);
}

// Modo medio //
function mediumMove(){
    let win = findBestMove("O");
    if(win!==null){ playMove(win); return true; }
    let block = findBestMove("X");
    if(block!==null){ playMove(block); return true; }
    return false;
}

function findBestMove(player){
    for(let condition of winConditions){
        let [a,b,c] = condition;
        let values = [options[a],options[b],options[c]];
        if(values.filter(v=>v===player).length===2 && values.includes("")) return condition[values.indexOf("")];
    }
    return null;
}

// Modo difícil//
function bestMoveMinimax() {
    let bestScore = -Infinity;
    let move = -1;
    for(let i=0;i<options.length;i++){
        if(options[i]===""){
            options[i]="O";
            let score = minimax(options, 0, false);
            options[i] = "";
            if(score > bestScore){ bestScore = score; move = i; }
        }
    }
    if(move!==-1) playMove(move); else randomMove();
}

function minimax(board,depth,isMax){
    let result = evaluate(board);
    if(result!==null) return result + depth;

    if(isMax){
        let best = -Infinity;
        for(let i=0;i<board.length;i++){
            if(board[i]===""){
                board[i]="O";
                best = Math.max(best,minimax(board,depth+1,false));
                board[i]="";
            }
        }
        return best;
    } else {
        let best = Infinity;
        for(let i=0;i<board.length;i++){
            if(board[i]===""){
                board[i]="X";
                best = Math.min(best,minimax(board,depth+1,true));
                board[i]="";
            }
        }
        return best;
    }
}

function evaluate(board){
    for(let condition of winConditions){
        let [a,b,c] = condition;
        if(board[a] && board[a]===board[b] && board[a]===board[c]){
            return board[a]==="O"?10:-10;
        }
    }
    if(!board.includes("")) return 0;
    return null;
}

function playMove(index){
    let cell = cells[index];
    if(mode === "pvm" && currentPlayer !== "O") currentPlayer = "O";
    updateCell(cell,index);
    checkWinner();
    if(running && mode === "pvp") changePlayer();
    if (running && mode === "pvm" && currentPlayer === "O") {
        currentPlayer = "X"
        statusText.textContent = `${getCurrentPlayerName()}'s turn`;
    }
}

function getCurrentPlayerName() {
    if (mode === "pvm" && currentPlayer === "O") return "Machine";
    return currentPlayer === "X" ? player1Name : player2Name;
}

// Reiniciar juego //
function restartGame() {
    currentPlayer = "X";
    options = ["", "", "", "", "", "", "", "", ""];
    Array.from(cells).forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("win");
    });
    running = true;
    statusText.textContent = `${getCurrentPlayerName()}'s turn`;
}

// Regresar a configuraciones del juego //
function backToSetup() {
    window.location.href = "index.html"
}
