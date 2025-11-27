let matrix;
let prev_matrix;
let leaderboard;
let score = 0;
let prev_score;
let size = 4;
let ANIMATION_DURATION = 250;
let rotationRules = {
  "Left": 0,
  "Up": 1,
  "Right": 2,
  "Down": 3
}
let rotate90cw = m => m[0].map((_, i) => m.map(row => row[i]).reverse());
let rotate90ccw = m => m[0].map((_, i) => m.map(row => row[i])).reverse();
let undoBtn, modal, messageEl, nameInput, saveBtn, restartBtn, tbody, score_field;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let SWIPE_THRESHOLD = 30;
let board = document.getElementById("board");


// ------------------- АНИМАЦИЯ -------------------


function createGrid() {
    let grid = document.querySelector("#board .grid");
    if (!grid) return;
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let cell = document.createElement("div");
            cell.classList.add("grid-cell");
            let coords = getTileCoord(row, col);
            cell.style.left = coords.left + "px";
            cell.style.top  = coords.top  + "px";
            grid.appendChild(cell);
        }
    }
}


function getTileCoord(row, col) {
    let tileSize = 90;
    let gap = 10;
    let offset = gap / 2;
    return {
        left: offset + col * (tileSize + gap),
        top:  offset + row * (tileSize + gap)
    };
}


function animateTile(fromRow, fromCol, toRow, toCol, value, merged=false, isNew=false) {
    let board = document.getElementById("board");
    let anim = document.createElement("div");
    anim.textContent = value;
    anim.dataset.value = value;

    anim.classList.add(isNew ? "newTile" : merged ? "mergeTile" : "moveTile");

    let class_value = (value >= 8192) ? "8192" : value.toString();
    anim.classList.add("tile" + class_value);

    let fromId = fromRow.toString() + fromCol.toString();
    let toId   = toRow.toString() + toCol.toString();
    let realFrom = document.getElementById(fromId);
    let realTo   = document.getElementById(toId);

    if (realFrom) {
        let cs = getComputedStyle(realFrom);
        anim.style.backgroundColor = cs.backgroundColor;
        anim.style.color = cs.color;
    } else if (realTo) {
        let cs = getComputedStyle(realTo);
        anim.style.backgroundColor = cs.backgroundColor;
        anim.style.color = cs.color;
    }
    board.appendChild(anim);
    let fromCoord = getTileCoord(fromRow, fromCol);
    let toCoord   = getTileCoord(toRow, toCol);
    anim.style.left = fromCoord.left + "px";
    anim.style.top  = fromCoord.top + "px";

    if (realFrom) realFrom.style.visibility = 'hidden';

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            anim.style.left = toCoord.left + "px";
            anim.style.top  = toCoord.top  + "px";
            if (isNew || merged) anim.classList.add("show");
        });
    });

    setTimeout(() => {
        anim.remove();
        if (realTo) {
            updateTileHTML(realTo, value);
        }
        if (realFrom) {
            let fromVal = matrix?.[fromRow]?.[fromCol] ?? 0;
            updateTileHTML(realFrom, fromVal);
            if (fromVal === 0) realFrom.style.visibility = 'hidden';
        }
    }, ANIMATION_DURATION);
}


function animateNewTile(row, col, value) {
    let board = document.getElementById("board");
    let tile = document.getElementById(row.toString() + col.toString());
    if (tile) tile.style.visibility = 'hidden';

    let anim = document.createElement("div");
    anim.textContent = value;
    anim.dataset.value = value;
    anim.classList.add("tile", "newTile");
    let class_value = (value >= 8192) ? "8192" : value.toString();
    anim.classList.add("tile" + class_value);

    let coords = getTileCoord(row, col);
    anim.style.position = "absolute";
    anim.style.left = coords.left + "px";
    anim.style.top = coords.top + "px";
    anim.style.transform = "scale(0)";
    anim.style.transition = "transform 200ms ease-out";

    board.appendChild(anim);

    requestAnimationFrame(() => {
        anim.style.transform = "scale(1)";
    });

    setTimeout(() => {
        anim.remove();
        if (tile) {
            updateTileHTML(tile, value);
            tile.style.visibility = 'visible';
        }
    }, ANIMATION_DURATION);
}


// ------------------- СВАЙПЫ -------------------

board.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;

    let t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
}, { passive: true });

board.addEventListener("touchend", (e) => {
    let t = e.changedTouches[0];
    touchEndX = t.clientX;
    touchEndY = t.clientY;

    handleSwipe();
}, { passive: true });

function handleSwipe() {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
        return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            slide(rotationRules.Right);
        } else {
            slide(rotationRules.Left);
        }
    } else {
        if (dy > 0) {
            slide(rotationRules.Down);
        } else {
            slide(rotationRules.Up);
        }
    }

    score_field.textContent = score;
}



// ------------------- HTML -------------------


function updateTileHTML(tile, value) {
    if (!tile) return;
    if (value === 0) {
        tile.style.visibility = 'hidden';
        tile.className = 'tile';
        tile.textContent = '';
        return;
    }

    tile.style.visibility = 'visible';
    tile.classList.value = "";
    tile.classList.add("tile");
    let class_value = (value >= 8192) ? "8192" : value.toString();
    tile.classList.add("tile" + class_value);
    tile.textContent = value.toString();
}


function createTilesHTML() {
    createGrid();
    document.getElementById("score").textContent = "0";
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", row.toString() + col.toString());
            tile.classList.add("tile");
            tile.style.position = "absolute";
            let coords = getTileCoord(row, col);
            tile.style.left = coords.left + "px";
            tile.style.top = coords.top + "px";
            tile.style.visibility = 'hidden';
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
        let nameTd = document.createElement("td");
        nameTd.textContent = entry.name;
        let scoreTd = document.createElement("td");
        scoreTd.textContent = entry.score;
        let dateTd = document.createElement("td");
        dateTd.textContent = entry.date;
        tr.appendChild(nameTd);
        tr.appendChild(scoreTd);
        tr.appendChild(dateTd);
        tbody.appendChild(tr);
    });
}


// ------------------- МЕХАНИКА -------------------


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

        let realTile = document.getElementById(row.toString() + col.toString());
        if (realTile) realTile.style.visibility = 'hidden';

        let anim = document.createElement("div");
        anim.textContent = value;
        anim.dataset.value = value;
        anim.classList.add("tile", "newTile");
        let class_value = (value >= 8192) ? "8192" : value.toString();
        anim.classList.add("tile" + class_value);

        let coords = getTileCoord(row, col);
        anim.style.position = "absolute";
        anim.style.left = coords.left + "px";
        anim.style.top = coords.top + "px";
        anim.style.transform = "scale(0)";
        anim.style.transition = "transform 200ms ease-out";

        document.getElementById("board").appendChild(anim);

        requestAnimationFrame(() => {
            anim.style.transform = "scale(1)";
        });

        setTimeout(() => {
            anim.remove();
            if (realTile) {
                updateTileHTML(realTile, value);
                realTile.style.visibility = 'visible';
            }
        }, ANIMATION_DURATION);
    }

    saveGameState();
}


function slideRow(row) {
    row = row.filter(num => num != 0);
    for (let i = 0; i < row.length - 1; i++) {
        if ((row[i] === row[i + 1]) && row[i] != 0) {
            row[i] *= 2;
            row[i + 1] = 0;
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
    prev_matrix = matrix.map(r => [...r]);
    prev_score = score;

    for (let i = 0; i < numRot; i++) matrix = rotate90ccw(matrix);

    for (let row = 0; row < size; row++) {
        let actions = [];
        let merged = new Array(size).fill(false);
        let newRow = [];

        for (let col = 0; col < size; col++) {
            if (matrix[row][col] === 0) continue;

            let last = newRow.length - 1;
            if (last >= 0 && newRow[last] === matrix[row][col] && !merged[last]) {
                newRow[last] *= 2;
                score += newRow[last];
                merged[last] = true;
                actions.push({ fromCol: col, toCol: last, val: newRow[last], merged: true });
            } else {
                newRow.push(matrix[row][col]);
                actions.push({ fromCol: col, toCol: newRow.length - 1, val: matrix[row][col], merged: false });
            }
        }

        while (newRow.length < size) newRow.push(0);
        matrix[row] = newRow;

        actions.forEach(act => {
            if (act.fromCol !== act.toCol || act.merged) {
                let [fromRowMapped, fromColMapped] = mapRotatedCoords(row, act.fromCol, numRot);
                let [toRowMapped, toColMapped] = mapRotatedCoords(row, act.toCol, numRot);
                animateTile(fromRowMapped, fromColMapped, toRowMapped, toColMapped, act.val, act.merged);
            }
        });
    }

    for (let i = 0; i < numRot; i++) matrix = rotate90cw(matrix);

    setTimeout(() => {
        updateAllTilesHTML();
        undoBtn.disabled = false;
        saveGameState();
        if (JSON.stringify(prev_matrix) !== JSON.stringify(matrix)) {
            spawnTiles(2, 0.1); // <- теперь новые плитки появляются после анимации
        }
        if (checkGameOver()) showGameOverWindow();
    }, ANIMATION_DURATION);
}


function mapRotatedCoords(row, col, numRot) {
    let r = row, c = col;
    for (let i = 0; i < numRot; i++) {
        [r, c] = [c, size - 1 - r];
    }
    return [r, c];
}


function restartGame() {
    let board = document.getElementById("board");
    Array.from(board.children).forEach(child => {
        if (!child.classList.contains("grid")) {
            board.removeChild(child);
        }
    });

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
    let state = {
        matrix,
        prev_matrix,
        score,
        prev_score,
        leaderboard
    };
    localStorage.setItem("gameState", JSON.stringify(state));
}


function loadGameState() {
    let raw = localStorage.getItem("gameState");
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
    matrix = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]
    undoBtn.disabled = true;
    createTilesHTML();
    spawnTiles(3, 0.1);
}


document.addEventListener('keydown', (e) => {
    if (e.code.startsWith("Arrow")) {
        e.preventDefault()
        slide(rotationRules[e.code.slice(5)]);
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


// ------------------- ЗАГРУЗКА -------------------


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
    // startGame();
    if (loadGameState()) {
        createTilesHTML();
        updateAllTilesHTML();
        score_field.textContent = score;
    } else {
        startGame();
        saveGameState();
    }
    updateLeaderboardHTML();
}