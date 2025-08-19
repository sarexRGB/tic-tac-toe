const cells = document.getElementsByClassName("q");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = false;

startGame()

function startGame() {
    Array.from(cells).forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    statusText.textContent = `${currentPlayer}'s turn`;
    running = true;
}

function cellClicked() {
    const cellIndex = this.getAttribute("cellIndex");

    if (options[cellIndex] != "" || !running || currentPlayer !== "X") {
        return;
    }

    updateCell(this, cellIndex);
    checkWinner();

    if (running) {
        setTimeout(machineMove, 500);
    }
}

function updateCell(cell, i) {
    options[i] = currentPlayer;
    cell.textContent = currentPlayer;
}

function changePlayer() {
    currentPlayer = (currentPlayer == "X") ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA == "" || cellB == "" || cellC == "") {
            continue;
        }
        if (cellA == cellB && cellB == cellC) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${currentPlayer} wins!`;
        running = false;
    }
    else if (!options.includes("")) {
        statusText.textContent = `Draw!`;
        running = false;
    }
    else {
        changePlayer();
    }
}

function machineMove() {
    let emptyCells = options
        .map((val, idx) => val === "" ? idx : null)
        .filter(val => val !== null);

    if (emptyCells.length === 0) {
         return
    };

    let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let cell = cells[randomIndex];

    updateCell(cell, randomIndex);
    checkWinner();
}

function restartGame() {
    currentPlayer = "X";
    options = ["", "", "", "", "", "", "", "", ""];
    statusText.textContent = `${currentPlayer}'s turn`;
    Array.from(cells).forEach(cell => cell.textContent = "");
    running = true;
}
