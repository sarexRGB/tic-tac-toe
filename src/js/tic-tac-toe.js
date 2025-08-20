// Variables //
const cells = document.getElementsByClassName("q");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const setupBtn = document.getElementById("setupBtn");

const mode = localStorage.getItem("mode") || "pvp";
const difficulty = localStorage.getItem("difficulty") || "easy";
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

// Iniciar juego //
startGame()

function startGame() {
    Array.from(cells).forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    setupBtn.addEventListener("click", backToSetup);

    statusText.textContent = `${getCurrentPlayerName()}'s turn`;
    running = true;
}

// Jugadas //
function cellClicked() {
    const cellIndex = this.getAttribute("cellIndex");

    if (options[cellIndex] !== "" || !running) return;

    updateCell(this, cellIndex);
    checkWinner();

    if (running && mode === "pvm" && currentPlayer === "O") {
        setTimeout(machineMove, 500);
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

    for (let condition of winConditions) {
        const [a,b,c] = condition;
        const cellA = options[a];
        const cellB = options[b];
        const cellC = options[c];

        if (cellA == "" || cellB == "" || cellC == "") continue;
        if (cellA == cellB && cellB == cellC) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${getCurrentPlayerName()} wins!`;
        running = false;
    }else if (!options.includes("")) {
        statusText.textContent = `Draw!`;
        running = false;
    }else {
        changePlayer();
    }
}

// IA //
function machineMove(){
    if(difficulty === "easy") randomMove();
    else if(difficulty === "medium") if(!mediumMove()) randomMove();
    else if(difficulty === "hard") bestMoveMinimax();
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
function bestMoveMinimax(){
    let bestScore = -Infinity;
    let move;
    for(let i=0;i<options.length;i++){
        if(options[i]===""){
            options[i]="O";
            let score = minimax(options,0,false);
            options[i]="";
            if(score>bestScore){ bestScore=score; move=i; }
        }
    }
    playMove(move);
}

function minimax(board,depth,isMax){
    let result = evaluate(board);
    if(result!==null) return result;

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
    updateCell(cell,index);
    checkWinner();
}

function getCurrentPlayerName() {
    if (mode === "pvm" && currentPlayer === "O") {
        return "Machine";
    }
    return currentPlayer === "X" ? player1Name : player2Name
}

// Reiniciar juego //
function restartGame() {
    currentPlayer = "X";
    options = ["", "", "", "", "", "", "", "", ""];
    statusText.textContent = `${getCurrentPlayerName()}'s turn`;
    Array.from(cells).forEach(cell => cell.textContent = "");
    running = true;
}

// Regresar a configuraciones del juego //
function backToSetup() {
    window.location.href = "index.html"
}
