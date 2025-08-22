// Variables //
const modeRadios = document.getElementsByName("mode");
const player2Div = document.getElementsByClassName("player2")[0];
const difficultyDiv = document.getElementById("difficulty");
const startBtn = document.getElementById("startBtn");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const difficultySelect = document.getElementById("difficultySelect");


function getSelectedMode() {
    for (let i= 0; i < modeRadios.length; i++) {
        if (modeRadios[i].checked) {
            return modeRadios[i].value;
        }
    }
    return "pvp";
}

// Actualización del formulario //
function updateForm() {
    const mode = getSelectedMode();
    if (mode === "pvp") {
        player2Div.style.display = "block";
        difficultyDiv.style.display = "none";
    } else {
        player2Div.style.display = "none";
        difficultyDiv.style.display = "block";
    }
}

// Actualizar cada vez que cambia el modo de juego//
for (let i = 0; i < modeRadios.length; i++) {
    modeRadios[i].addEventListener("change", updateForm);
}

updateForm();

// Botón para iniciar juego //
startBtn.addEventListener("click", () => {
    const mode = getSelectedMode();
    const player1 = player1Input.value.trim();
    const player2 = (mode === "pvp")
        ? player2Input.value.trim() || "player2"
        : "Machine";
    const difficulty = (mode === "pvm")
        ? difficultySelect.value
        :"";
        
    if (!player1) {
    Swal.fire({
        icon: "warning",
        title: "Missing name",
        text: "Please enter a name",
        confirmButtonText: "OK",
        customClass: {
        popup: 'popup',
        title: 'title',
        confirmButton: 'popupBtn',
        icon: 'icon'
    }
    });
    return;
    }

    localStorage.setItem("mode", mode);
    localStorage.setItem("player1", player1);
    localStorage.setItem("player2", player2);
    localStorage.setItem("difficulty", difficulty);

    window.location.href = "boardGame.html"
})

