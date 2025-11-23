let matrix;
let prev_matrix;
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
let undoBtn;


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
}



function slideRow(row) {
    row = row.filter(num => num != 0);
    console.log(row, row.length);
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
}


function startGame() {
    score = 0;
    matrix = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
    document.getElementById("score").textContent = "0";
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", row.toString() + col.toString())
            updateTileHTML(tile, matrix[row][col]);
            document.getElementById("board").append(tile);
        }
    }
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
    undoBtn.disabled = true;
}


window.onload = function() {
    undoBtn = document.getElementById("undoBtn")
    undoBtn.addEventListener("click", undoMove);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    startGame();
}
