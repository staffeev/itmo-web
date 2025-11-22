let matrix;
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
}



function startGame() {
    matrix = [
        [2, 2, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 2, 0],
        [0, 0, 0, 0]
    ]
    

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let tile = document.createElement("div");
            tile.setAttribute("id", row.toString() + col.toString())
            updateTileHTML(tile, matrix[row][col]);
            document.getElementById("board").append(tile);
        }
    }
    
}


document.addEventListener('keydown', (e) => {
    if (e.code.startsWith("Arrow")) {
        e.preventDefault()
        slide(rotationRules[e.code.slice(5)]);
    }
    document.getElementById("score").textContent = score;
})


window.onload = function() {
    startGame();
}
