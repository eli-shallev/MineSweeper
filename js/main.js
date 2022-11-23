'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gIsFirstClick
var gScoreInterval
var gBoard
var gLives
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
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLives = 3
    gIsFirstClick = true
    clearInterval(gScoreInterval)

    const elBtn = document.querySelector('.main-btn')
    elBtn.innerText = '😀'

    const elTimer = document.querySelector('.timer span')
    elTimer.innerText = gGame.secsPassed

    const elLives = document.querySelector('.lives span')
    elLives.innerText = gLives

}


function buildBoard(elClickedCell) {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = createCell()

        }
    }

    if (elClickedCell) {
        const clickedCellI = +elClickedCell.dataset.i
        const clickedCellJ = +elClickedCell.dataset.j
        for (var i = 0; i < gLevel.MINES; i++) {
            var idxI = getRandomInt(0, gLevel.SIZE)
            var idxJ = getRandomInt(0, gLevel.SIZE)
            while (clickedCellI === idxI && clickedCellJ === idxJ) {
                idxI = getRandomInt(0, gLevel.SIZE)
                idxJ = getRandomInt(0, gLevel.SIZE)
            }

            const cell = board[idxI][idxJ]
            if (cell.isMine) i--

            cell.isMine = true

        }



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


function getNeighborsLocations(board, cellI, cellJ) {
    const neighborsLocations = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            const location = {
                i: i,
                j: j
            }
            neighborsLocations.push(location)
        }
    }
    return neighborsLocations

}

function getMineNeighborsCount(board, cellI, cellJ) {
    var neighborsCount = 0

    const neighborsLocations = getNeighborsLocations(board, cellI, cellJ)
    for (var i = 0; i < neighborsLocations.length; i++) {
        const cell = board[neighborsLocations[i].i][neighborsLocations[i].j]
        if (cell.isMine) neighborsCount++
    }

    return neighborsCount
}

function startGame(elClickedCell) {
    gBoard = buildBoard(elClickedCell)
    renderBoard(gBoard, '.board-container')
    gGame.isOn = true
    gIsFirstClick = false

    gScoreInterval = setInterval(() => {
        gGame.secsPassed++
        const elTimer = document.querySelector('.timer span')
        elTimer.innerText = gGame.secsPassed

        const elLives = document.querySelector('.lives span')
        elLives.innerText = gLives
    }, 1000);
}




function cellClicked(elCell) {
    if (gIsFirstClick) {
        startGame(elCell)
    }

    if (!gGame.isOn) return


    const location = {
        i: elCell.dataset.i,
        j: elCell.dataset.j
    }
    const cell = gBoard[location.i][location.j]

    if (cell.isMarked) return
    if (cell.isShown) return

    cell.isShown = true
    gGame.shownCount++


    renderCell(location)

    if (cell.isMine) {
        if (gLives === 0) {
            gameOver(false)
        } else {
            cell.isShown = true
            renderCell(location)
            gLives--
            setTimeout(() => {
                cell.isShown = false
                renderCell(location)
            }, 1000);
        }
    }

    if (checkGameOver()) gameOver(true)

    const cellI = +location.i
    const cellJ = +location.j

    if (cell.minesAroundCount === 0 && !cell.isMine) {
        expandShown(gBoard, cellI, cellJ)
    }

}

function cellMarked(elCell) {
    if (gIsFirstClick) {
        startGame(elCell)
    }

    if (!gGame.isOn) return

    const location = {
        i: elCell.dataset.i,
        j: elCell.dataset.j
    }
    const cell = gBoard[location.i][location.j]

    if (!cell.isShown) {
        if (cell.isMarked) {
            cell.isMarked = false
            gGame.markedCount--
        } else {
            cell.isMarked = true
            gGame.markedCount++
        }
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
    gGame.isOn = false
    clearInterval(gScoreInterval)
    if (isVicroty) {
        const elBtn = document.querySelector('.main-btn')
        elBtn.innerText = '😎'
    } else {
        const elBtn = document.querySelector('.main-btn')
        elBtn.innerText = '😵'
        revealMines()
    }
}


function expandShown(board, i, j) {
    const neighborsLocations = getNeighborsLocations(board, i, j)

    for (var i = 0; i < neighborsLocations.length; i++) {
        const negLocation = neighborsLocations[i]
        const negCell = gBoard[negLocation.i][negLocation.j]
        negCell.isShown = true
        gGame.shownCount++
        renderCell(negLocation)
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) {
                cell.isShown = true
                const location = {
                    i: i,
                    j: j
                }
                renderCell(location)
            }
        }
    }
}

function changeDifficulty(level) {
    if (level === 1) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    }
    if (level === 2) {
        gLevel.SIZE = 8
        gLevel.MINES = 14
    }
    if (level === 3) {
        gLevel.SIZE = 12
        gLevel.MINES = 32
    }
    onInit()
}