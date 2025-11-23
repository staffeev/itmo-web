let matrix;
let prev_matrix;
let leaderboard;
let score = 0;
let prev_score;
const size = 4;
const rotationRules = {
  "Left": 0,
  "Up": 1,
  "Right": 2,
  "Down": 3
}
const rotate90cw = m => m[0].map((_, i) => m.map(row => row[i]).reverse());
const rotate90ccw = m => m[0].map((_, i) => m.map(row => row[i])).reverse();
let undoBtn, modal, messageEl, nameInput, saveBtn, restartBtn, tbody, score_field;


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


function updateLeaderboardHTML() {
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    leaderboard.forEach(entry => {
        let tr = document.createElement("tr");
        // поля
        let nameTd = document.createElement("td");
        nameTd.textContent = entry.name;
        let scoreTd = document.createElement("td");
        scoreTd.textContent = entry.score;
        let dateTd = document.createElement("td");
        dateTd.textContent = entry.date;
        // добавление
        tr.appendChild(nameTd);
        tr.appendChild(scoreTd);
        tr.appendChild(dateTd);
        tbody.appendChild(tr);
    });
}


function getEmptyCells() {
    let emptyCells = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (matrix[row][col] === 0) emptyCells.push([row, col]);
        }
    }
    return emptyCells;
}


function spawnTiles(maxCount = 1, chanceForFour = 0.1) {
    let emptyCells = getEmptyCells();

    let count = 1;
    if (maxCount == 2 && Math.random() < 0.2) count = 2;
    if (maxCount == 3 && Math.random() < 0.05) count = 3;
    count = Math.min(count, emptyCells.length);

    for (let i = 0; i < count && emptyCells.length > 0; i++) {
        let idx = Math.floor(Math.random() * emptyCells.length);
        let [row, col] = emptyCells.splice(idx, 1)[0];
        let value = Math.random() < chanceForFour ? 4 : 2;
        matrix[row][col] = value;
        let tile = document.getElementById(row.toString() + col.toString());
        updateTileHTML(tile, value);
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
    prev_score = score;
    for (let i = 0; i < numRot; i++) {
        matrix = rotate90ccw(matrix)
    }
    for (let row = 0; row < size; row++) {
        let matrix_row = matrix[row]
        matrix[row] = slideRow(matrix_row, row);
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
    score = prev_score;
    updateAllTilesHTML();
    saveGameState(); 
    undoBtn.disabled = true;
    score_field.textContent = score;
}


function checkGameOver() {
    if (getEmptyCells().length > 0) return false;
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
    messageEl.textContent = "Ваш рекорд сохранён!";
    nameInput.classList.add("hidden");
    saveBtn.classList.add("hidden");
    updateLeaderboardHTML();
}


function saveGameState() {
    const state = {
        matrix,
        prev_matrix,
        score,
        prev_score,
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
    prev_score = state.prev_score;
    leaderboard = state.leaderboard || [];
    return true;
}


function startGame() {
    score = 0;
    // matrix = [
    //     [2, 4, 8, 16],
    //     [16, 8, 4, 2],
    //     [2, 4, 8, 16],
    //     [16, 8, 4, 2]
    // ]
    matrix = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]
    undoBtn.disabled = true;
    createTilesHTML();
    spawnTiles(3, 0.1);
    // addTwo();
    // addTwo();
}


document.addEventListener('keydown', (e) => {
    if (e.code.startsWith("Arrow")) {
        e.preventDefault()
        slide(rotationRules[e.code.slice(5)]);
        spawnTiles(2, 0.1);
    }
    score_field.textContent = score;
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
    tbody = document.getElementById("leaderboardBody");
    score_field = document.getElementById("score")

    saveBtn.disabled = true;
    nameInput.addEventListener("input", () => {
        saveBtn.disabled = nameInput.value.trim() === "";
    });
    startGame();
    // if (loadGameState()) {
    //     createTilesHTML();
    //     updateAllTilesHTML();
    //     score_field.textContent = score;
    // } else {
    //     startGame();
    //     saveGameState();
    // }
    updateLeaderboardHTML();
}
