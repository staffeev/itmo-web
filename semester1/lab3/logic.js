let matrix;
let prev_matrix;
let leaderboard;
let score = 0;
const size = 4;
const rotationRules = {
  "Left": 0,
  "Up": 1,
  "Right": 2,
  "Down": 3
}
const rotate90cw = m => m[0].map((_, i) => m.map(row => row[i]).reverse());
const rotate90ccw = m => m[0].map((_, i) => m.map(row => row[i])).reverse();
let undoBtn, modal, messageEl, nameInput, saveBtn, restartBtn;


function updateTileHTML(tile, value) {
    tile.classList.value = "";
    tile.classList.add("tile");
    tile.textContent = "";
    if (value == 0) {
       return;
    }
    tile.classList.add("tile" + value.toString());
    tile.textContent = value.toString();
}


function createTilesHTML() {
    document.getElementById("score").textContent = "0";
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", row.toString() + col.toString())
            updateTileHTML(tile, matrix[row][col]);
            document.getElementById("board").append(tile);
        }
    }
}


function updateAllTilesHTML() {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col ++) {
            tile = document.getElementById(row.toString() + col.toString());
            updateTileHTML(tile, matrix[row][col]);
        }
    }
}


function checkForEmpty() {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (matrix[row][col] == 0) {
                return true;
            }
        }
    }
    return false;
}


function addTwo() {
    if (!checkForEmpty()) {
      return;
    }
    let created = false;
    while (!created) {
        let row = Math.floor(Math.random() * size);
        let col = Math.floor(Math.random() * size);
        if (matrix[row][col] != 0) continue;
        let tile = document.getElementById(row.toString() + col.toString());
        updateTileHTML(tile, 2)
        matrix[row][col] = 2;
        created = true;
    }
    saveGameState();
}


function slideRow(row) {
    row = row.filter(num => num != 0);
    for (let i = 0; i < row.length - 1; i++) {
        if ((row[i] === row[i + 1]) && row[i] != 0) {
            row[i] *= 2;
            row[i + 1] = 0;
            //update score
            score += row[i];
        }
    }
    row = row.filter(num => num != 0);
    while (row.length != size) {
        row.push(0);
    } 
    return row;
}


function slide(numRot) {
    prev_matrix = matrix.slice();
    for (let i = 0; i < numRot; i++) {
        matrix = rotate90ccw(matrix)
    }
    for (let row = 0; row < size; row++) {
        let matrix_row = matrix[row]
        matrix[row] = slideRow(matrix_row);
    }
    for (let i = 0; i < numRot; i++) {
        matrix = rotate90cw(matrix)
    }
    updateAllTilesHTML();
    undoBtn.disabled = false;
    saveGameState();
    if (checkGameOver()) {
        showGameOverWindow();
    }
}


function restartGame() {
    board = document.getElementById("board")
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }
    startGame();
}


function undoMove() {
    matrix = prev_matrix;
    updateAllTilesHTML();
    saveGameState(); 
    undoBtn.disabled = true;
}


function checkGameOver() {
    if (checkForEmpty()) return false;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (col < size - 1 && matrix[row][col] === matrix[row][col + 1]) {
                return false;
            }
            if (row < size - 1 && matrix[row][col] === matrix[row + 1][col]) {
                return false;
            }
        }
    }
    return true;
}


function saveGameResult() {
    let name = nameInput.value.trim();
    if (name === "") return;

    let date = new Date().toLocaleDateString("ru-RU");

    leaderboard.push({
        name: name,
        score: score,
        date: date
    });

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    console.log(leaderboard);
    

    messageEl.textContent = "Ваш рекорд сохранён!";
    nameInput.classList.add("hidden");
    saveBtn.classList.add("hidden");
}



function saveGameState() {
    const state = {
        matrix,
        prev_matrix,
        score,
        leaderboard
    };
    localStorage.setItem("gameState", JSON.stringify(state));
}


function loadGameState() {
    const raw = localStorage.getItem("gameState");
    if (!raw) return false;

    let state = JSON.parse(raw);
    matrix = state.matrix;
    prev_matrix = state.prev_matrix;
    score = state.score;
    leaderboard = state.leaderboard || [];
    return true;
}


function startGame() {
    score = 0;
    matrix = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2]
    ]
    // matrix = [
    //     [0, 0, 0, 0],
    //     [0, 0, 0, 0],
    //     [0, 0, 0, 0],
    //     [0, 0, 0, 0],
    // ]
    createTilesHTML();
    addTwo();
    addTwo();
}


document.addEventListener('keydown', (e) => {
    if (e.code.startsWith("Arrow")) {
        e.preventDefault()
        slide(rotationRules[e.code.slice(5)]);
        addTwo();
    }
    document.getElementById("score").textContent = score;
})


function showGameOverWindow() {
    messageEl.textContent = "Игра окончена! Введите имя, чтобы сохранить результат:";
    nameInput.classList.remove("hidden");
    saveBtn.disabled = nameInput.value.trim() === "";
    saveBtn.classList.remove("hidden");
    modal.classList.remove("hidden");
}


function hideGameOverWindow() {
    modal.classList.add("hidden");
}


window.onload = function() {
    undoBtn = document.getElementById("undoBtn")
    undoBtn.addEventListener("click", undoMove);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("restartBtn2").addEventListener("click", () => {
        hideGameOverWindow();
        restartGame();
    });

    modal = document.getElementById("gameOverModal");
    messageEl = document.getElementById("gameOverMessage");
    nameInput = document.getElementById("playerNameInput");
    saveBtn = document.getElementById("saveScoreBtn");
    saveBtn.addEventListener("click", saveGameResult);

    saveBtn.disabled = true;
    nameInput.addEventListener("input", () => {
        saveBtn.disabled = nameInput.value.trim() === "";
    });

    // startGame();
    if (loadGameState()) {
        createTilesHTML();
        updateAllTilesHTML();
        document.getElementById("score").textContent = score;
    } else {
        startGame();
        saveGameState();
    }
}
