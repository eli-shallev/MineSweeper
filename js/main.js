'use strict'

const MINE = '💣'
const FLAG = '🚩'


var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}



function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')

}


function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = createCell()

        }
    }

    for (var i = 0; i < gLevel.MINES; i++) {
        const idxI = getRandomInt(0, gLevel.SIZE)
        const idxJ = getRandomInt(0, gLevel.SIZE)
        board[idxI][idxJ].isMine = true
    }

    setMinesNegsCount(board)

    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (!cell.isMine) {
                cell.minesAroundCount = getMineNeighborsCount(board, i, j)
            }
        }
    }


}


function getMineNeighborsCount(board, cellI, cellJ) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue

            if (board[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}

function cellClicked(elCell) {
    const location = {
        i: elCell.dataset.i,
        j: elCell.dataset.j
    }
    const cell = gBoard[location.i][location.j]
    cell.isShown = true
    renderCell(location)

    if (cell.isMine) gameOver(false)

    if (checkGameOver()) gameOver(true)

}

function cellMarked(elCell) {
    const location = {
        i: elCell.dataset.i,
        j: elCell.dataset.j
    }
    const cell = gBoard[location.i][location.j]

    if (!cell.isShown) {
        cell.isMarked = !cell.isMarked
        renderCell(location)
    }

    if (checkGameOver()) gameOver(true)


}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && !cell.isMarked) return false
            if (!cell.isShown && !cell.isMarked) return false
            if (!cell.isMine && cell.isMarked) return false
        }
    }
    return true
}

function gameOver(isVicroty) {
    if (isVicroty) {
        alert('Wineeeer')
    } else {
        alert('Loseeeer')
    }
}

