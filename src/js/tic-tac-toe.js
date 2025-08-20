// Variables //
const cells = document.getElementsByClassName("q");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");

const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");

const pvpBtn = document.getElementById("pvpBtn");
const pvmBtn = document.getElementById("pvmBtn");

const winConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = false;
let difficulty = "easy";
let mode = "pvm"; //pvm= player vs machine, pvp= player vs player

// Iniciar juego //
startGame()

function startGame() {
    Array.from(cells).forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);

    easyBtn.addEventListener("click", () => setDifficulty("easy"));
    mediumBtn.addEventListener("click", () => setDifficulty("medium"));
    hardBtn.addEventListener("click", () => setDifficulty("hard"));

    pvpBtn.addEventListener("click", () => setMode("pvp"));
    pvmBtn.addEventListener("click", () => setMode("pvm"));

    statusText.textContent = `${currentPlayer}'s turn`;
    running = true;
    highlightDifficultyButton();
    highlightModeButton();
}

// Jugadas //
function cellClicked() {
    const cellIndex = this.getAttribute("cellIndex");

    if (options[cellIndex] !== "" || !running) return;

    updateCell(this, cellIndex);
    checkWinner();

    if (running && mode === "pvm" && currentPlayer === "O") {
        setTimeout(machineMove, 300);
    }
}

function updateCell(cell, i) {
    options[i] = currentPlayer;
    cell.textContent = currentPlayer;
}

function changePlayer() {
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`
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
        statusText.textContent = `${currentPlayer} wins!`;
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

// Modo de juego //
function setMode(selectedMode) {
    mode = selectedMode;
    restartGame();
    highlightModeButton();
}

function highlightModeButton() {
    pvpBtn.classList.remove("avtive");
    pvmBtn.classList.remove("avtive");
    if(mode === "pvp") pvpBtn.classList.add("active");
    if(mode === "pvm") pvmBtn.classList.add("active");
}

// Dificultad de IA //
function setDifficulty(level) {
    difficulty = level;
    restartGame();
    highlightDifficultyButton();
}

function highlightDifficultyButton(){
    easyBtn.classList.remove("active");
    mediumBtn.classList.remove("active");
    hardBtn.classList.remove("active");

    if(difficulty==="easy") easyBtn.classList.add("active");
    if(difficulty==="medium") mediumBtn.classList.add("active");
    if(difficulty==="hard") hardBtn.classList.add("active");
}

// Reiniciar juego //
function restartGame() {
    currentPlayer = "X";
    options = ["", "", "", "", "", "", "", "", ""];
    statusText.textContent = `${currentPlayer}'s turn`;
    Array.from(cells).forEach(cell => cell.textContent = "");
    running = true;
}
