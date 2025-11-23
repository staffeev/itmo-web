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




function createGrid() {
    const board = document.getElementById("board");
    const tileSize = 90;
    const gap = 10;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-cell");

            // позиционируем точно под плиткой
            const left = col * (tileSize + gap);
            const top = row * (tileSize + gap);

            cell.style.left = left + "px";
            cell.style.top = top + "px";

            board.appendChild(cell);
        }
    }
}



// function createTilesHTML() {
//     document.getElementById("score").textContent = "0";
//     for (let row = 0; row < size; row++) {
//         for (let col = 0; col < size; col++) {
//             let tile = document.createElement("div");
//             tile.setAttribute("id", row.toString() + col.toString())
//             updateTileHTML(tile, matrix[row][col]);
//             document.getElementById("board").append(tile);
//         }
//     }
// }


function createTilesHTML() {
    document.getElementById("score").textContent = "0";
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", row.toString() + col.toString());
            tile.classList.add("tile");
            updateTileHTML(tile, matrix[row][col]);
            tile.style.position = "absolute";
            const coords = getTileCoord(row, col);
            tile.style.left = coords.left + "px";
            tile.style.top = coords.top + "px";
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


// function hideRealTiles() {
//     for (let row = 0; row < size; row++) {
//         for (let col = 0; col < size; col++) {
//             const tile = document.getElementById(row.toString() + col.toString());
//             tile.style.visibility = 'hidden';
//         }
//     }
// }

// function showRealTiles() {
//     for (let row = 0; row < size; row++) {
//         for (let col = 0; col < size; col++) {
//             const tile = document.getElementById(row.toString() + col.toString());
//             tile.style.visibility = 'visible';
//         }
//     }
// }


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


function getTileCoord(row, col) {
    const board = document.getElementById("board");
    const boardRect = board.getBoundingClientRect();
    const tileSize = 90;
    const gap = 6;

    const left = boardRect.left + col * (tileSize + gap);
    const top = boardRect.top + row * (tileSize + gap);
    return { left, top };
}

// function animateTile(fromRow, fromCol, toRow, toCol, value, merged=false, isNew=false) {
//     const board = document.getElementById("board");
//     const anim = document.createElement("div");
//     anim.textContent = value;
//     anim.dataset.value = value;
    
//     let className = "moveTile";
//     if (merged) className = "mergeTile";
//     if (isNew) className = "newTile";
//     anim.classList.add(className);
//     board.appendChild(anim);

//     const fromCoord = getTileCoord(fromRow, fromCol);
//     const toCoord = getTileCoord(toRow, toCol);
//     anim.style.left = fromCoord.left + "px";
//     anim.style.top = fromCoord.top + "px";

//     requestAnimationFrame(() => {
//         anim.style.left = toCoord.left + "px";
//         anim.style.top = toCoord.top + "px";
//         if (isNew || merged) anim.classList.add("show");
//     });

//     setTimeout(() => {
//         anim.remove();
//         const tile = document.getElementById(toRow.toString() + toCol.toString());
//         updateTileHTML(tile, value);
//         showRealTiles();
//     }, 500);
// }



function animateTile(fromRow, fromCol, toRow, toCol, value, merged=false, isNew=false) {
    const board = document.getElementById("board");
    const anim = document.createElement("div");
    anim.textContent = value;
    anim.dataset.value = value;

    anim.classList.add(isNew ? "newTile" : merged ? "mergeTile" : "moveTile");

    const realTile = document.getElementById(fromRow.toString() + fromCol.toString());
    anim.style.backgroundColor = getComputedStyle(realTile).backgroundColor;
    anim.style.color = getComputedStyle(realTile).color;

    board.appendChild(anim);

    realTile.style.visibility = 'hidden';

    const fromCoord = getTileCoord(fromRow, fromCol);
    const toCoord = getTileCoord(toRow, toCol);
    anim.style.left = fromCoord.left + "px";
    anim.style.top = fromCoord.top + "px";

    requestAnimationFrame(() => {
        anim.style.left = toCoord.left + "px";
        anim.style.top = toCoord.top + "px";
        if (isNew || merged) anim.classList.add("show");
    });

    setTimeout(() => {
        anim.remove();
        const targetTile = document.getElementById(toRow.toString() + toCol.toString());
        updateTileHTML(targetTile, value);
        targetTile.style.visibility = 'visible';
    }, 160);
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
        animateTile(row, col, row, col, value, false, true);
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



// function slide(numRot) {
//     prev_matrix = matrix.map(r => [...r]);
//     prev_score = score;
//     hideRealTiles();
//     for (let i = 0; i < numRot; i++) matrix = rotate90ccw(matrix);

//     for (let row = 0; row < size; row++) {
//         let originalRow = [...matrix[row]];
//         let actions = []; // массив действий для анимации
//         let merged = new Array(size).fill(false);

//         let newRow = [];
//         for (let col = 0; col < size; col++) {
//             if (matrix[row][col] === 0) continue;
//             let last = newRow.length - 1;
//             if (last >= 0 && newRow[last] === matrix[row][col] && !merged[last]) {
//                 newRow[last] *= 2;
//                 score += newRow[last];
//                 merged[last] = true;
//                 actions.push({ fromCol: col, toCol: last, val: newRow[last], merged: true });
//             } else {
//                 newRow.push(matrix[row][col]);
//                 actions.push({ fromCol: col, toCol: newRow.length - 1, val: matrix[row][col], merged: false });
//             }
//         }
//         while (newRow.length < size) newRow.push(0);
//         matrix[row] = newRow;

//         actions.forEach(act => {
//             if (act.fromCol !== act.toCol || act.merged) {
//                 let [fromRowMapped, fromColMapped] = mapRotatedCoords(row, act.fromCol, numRot);
//                 let [toRowMapped, toColMapped] = mapRotatedCoords(row, act.toCol, numRot);
//                 animateTile(fromRowMapped, fromColMapped, toRowMapped, toColMapped, act.val, act.merged);
//             }
//         });
//     }

//     for (let i = 0; i < numRot; i++) matrix = rotate90cw(matrix);

//     updateAllTilesHTML();
//     undoBtn.disabled = false;
//     saveGameState();
//     if (checkGameOver()) showGameOverWindow();
// }


function slide(numRot) {
    prev_matrix = matrix.map(r => [...r]);
    prev_score = score;

    let tilesToHide = [];

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
                tilesToHide.push([row, col]);
            } else {
                newRow.push(matrix[row][col]);
                actions.push({ fromCol: col, toCol: newRow.length - 1, val: matrix[row][col], merged: false });
                if (col !== newRow.length - 1) tilesToHide.push([row, col]);
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

    tilesToHide.forEach(([r, c]) => {
        const tile = document.getElementById(r.toString() + c.toString());
        if (tile) tile.style.visibility = 'hidden';
    });

    for (let i = 0; i < numRot; i++) matrix = rotate90cw(matrix);

    setTimeout(() => {
        tilesToHide.forEach(([r, c]) => {
            const tile = document.getElementById(r.toString() + c.toString());
            if (tile) tile.style.visibility = 'visible';
        });
        updateAllTilesHTML();
        undoBtn.disabled = false;
        saveGameState();
        if (checkGameOver()) showGameOverWindow();
    }, 500);
}


function mapRotatedCoords(row, col, numRot) {
    let r = row, c = col;
    for (let i = 0; i < numRot; i++) {
        [r, c] = [c, size - 1 - r];
    }
    return [r, c];
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
    createGrid();
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
