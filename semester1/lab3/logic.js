let matrix;
const size = 4;


function updateTileHTML(tile, value) {
    tile.classList.value = "";
    tile.classList.add("tile");
    if (value == 0) {
      return;
    }
    tile.classList.add("tile" + value.toString());
    tile.textContent = value.toString();
}


function slide(row) {
    row = row.filter(num => num != 0);
    for (let i = 0; i < size - 1; i++) {
        if (row[i] == row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
        }
    }
    row = row.filter(num => num != 0);
    while (row.length != size) {
        row.push(0);
    }
    return row;
}


function startGame() {
    matrix = [
        [0, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 4, 0],
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





window.onload = function() {
    startGame();
}
