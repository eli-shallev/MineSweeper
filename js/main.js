'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gIsFirstClick
var gScoreInterval
var gBoard
var gLives
var gSafeClicksLeft
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

var gIsHintMode
var gElCurrHint

function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLives = 3
    gSafeClicksLeft = 3
    gIsFirstClick = true
    gIsHintMode = false
    clearInterval(gScoreInterval)

    const elBtn = document.querySelector('.main-btn')
    elBtn.innerText = '😀'

    const elTimer = document.querySelector('.timer span')
    elTimer.innerText = (`00${gGame.secsPassed}`).slice(-3)

    const elLives = document.querySelector('.lives span')
    elLives.innerText = '💖 💖 💖'

    const elSafeClick = document.querySelector('.safe-click span')
    elSafeClick.innerText = gSafeClicksLeft

    const elHints = document.querySelectorAll('.hint')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].hidden = false
    }

    if (!localStorage.getItem('beginner')) {
        localStorage.setItem('beginner', '999')
    }
    if (!localStorage.getItem('medium')) {
        localStorage.setItem('medium', '999')
    }
    if (!localStorage.getItem('expert')) {
        localStorage.setItem('expert', '999')
    }
    const elBeginner = document.querySelector('.beginner')
    elBeginner.innerText = localStorage.getItem('beginner')

    const elMedium = document.querySelector('.medium')
    elMedium.innerText = localStorage.getItem('medium')

    const elExpert = document.querySelector('.expert')
    elExpert.innerText = localStorage.getItem('expert')

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
        elTimer.innerText = (`00${gGame.secsPassed}`).slice(-3)
    }, 1000);
}

function addShown(location) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.classList.add('shown')
    elCell.classList.remove('untouched')
}

function hendleHint(elCell) {
    const location = {
        i: +elCell.dataset.i,
        j: +elCell.dataset.j
    }
    const cell = gBoard[location.i][location.j]
    cell.isShownByHint = true
    renderCell(location)

    const neighborsLocations = getNeighborsLocations(gBoard, location.i, location.j)
    for (var i = 0; i < neighborsLocations.length; i++) {
        const newLocation = neighborsLocations[i]
        const newCell = gBoard[newLocation.i][newLocation.j]
        newCell.isShownByHint = true
        renderCell(newLocation)
    }
    gIsHintMode = false
    gElCurrHint.classList.remove('hint-selected')
    gElCurrHint.hidden = true
    gElCurrHint = null

    setTimeout(() => {
        const location = {
            i: +elCell.dataset.i,
            j: +elCell.dataset.j
        }
        const cell = gBoard[location.i][location.j]
        cell.isShownByHint = false
        renderCell(location)

        const neighborsLocations = getNeighborsLocations(gBoard, +elCell.dataset.i, +elCell.dataset.j)
        for (var i = 0; i < neighborsLocations.length; i++) {
            const location = neighborsLocations[i]
            const newCell = gBoard[location.i][location.j]
            newCell.isShownByHint = false
            renderCell(location)
        }

    }, 1000);
}

function cellClicked(elCell) {
    if (gIsHintMode) {
        hendleHint(elCell)
        return
    }

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
    addShown(location)
    gGame.shownCount++
    renderCell(location)

    if (cell.isMine) {
        if (gLives === 0) {
            gameOver(false)
        } else {
            cell.isShown = true
            addShown(location)
            renderCell(location)
            gLives--
            var livesStr = ''
            for (var i = 0; i < gLives; i++) {
                livesStr += '💖 '
            }
            const elLives = document.querySelector('.lives span')
            elLives.innerText = livesStr
            setTimeout(() => {
                cell.isShown = false
                elCell.classList.remove('shown')
                elCell.classList.add('untouched')
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
            elCell.classList.remove('marked')
            elCell.classList.add('untouched')
        } else {
            cell.isMarked = true
            gGame.markedCount++
            elCell.classList.add('marked')
            elCell.classList.remove('untouched')
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
        updateBestScore()
        const elBtn = document.querySelector('.main-btn')
        elBtn.innerText = '😎'
    } else {
        const elBtn = document.querySelector('.main-btn')
        elBtn.innerText = '😵'
        revealMines()
    }
}

function expandShown(board, i, j, ch) {
    const neighborsLocations = getNeighborsLocations(board, i, j)
    for (var idx = 0; idx < neighborsLocations.length; idx++) {
        const negLocation = neighborsLocations[idx]
        const negCell = board[negLocation.i][negLocation.j]
        addShown(negLocation)
        negCell.isShown = true
        gGame.shownCount++
        renderCell(negLocation)
    }

    if (!ch) {
        for (idx = 0; idx < neighborsLocations.length; idx++) {
            const negLocation = neighborsLocations[idx]
            const negCell = board[negLocation.i][negLocation.j]
            if (negCell.minesAroundCount === 0) expandShown(board, negLocation.i, negLocation.j, true)
        }
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

function hintClicked(elHint) {
    if (elHint.classList.contains('hint-selected')) {
        elHint.classList.remove('hint-selected')
        gIsHintMode = false
        gElCurrHint = null
    } else {
        const elHints = document.querySelectorAll('.hint')
        for (var i = 0; i < elHints.length; i++) {
            if (elHints[i].classList.contains('hint-selected')) return
        }
        elHint.classList.add('hint-selected')
        gIsHintMode = true
        gElCurrHint = elHint
    }

}

function updateBestScore() {
    if (gLevel.SIZE === 4) {
        if (gGame.secsPassed < +localStorage.getItem('beginner')) {
            localStorage.setItem('beginner', gGame.secsPassed)
            const elBeginner = document.querySelector('.beginner')
            elBeginner.innerText = localStorage.getItem('beginner')
        }
    }
    if (gLevel.SIZE === 8) {
        if (gGame.secsPassed < +localStorage.getItem('medium')) {
            localStorage.setItem('medium', gGame.secsPassed)
            const elMedium = document.querySelector('.medium')
            elMedium.innerText = localStorage.getItem('medium')
        }
    }
    if (gLevel.SIZE === 12) {
        if (gGame.secsPassed < +localStorage.getItem('expert')) {
            localStorage.setItem('expert', gGame.secsPassed)
            const elExpert = document.querySelector('.expert')
            elExpert.innerText = localStorage.getItem('expert')
        }
    }
}

function safeClick() {
    if (gSafeClicksLeft === 0) return

    const safeCellsLocations = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const location = {
                i: i,
                j: j
            }
            const cell = gBoard[location.i][location.j]
            if (!cell.isMine && !cell.isShown && !cell.isMarked) {
                safeCellsLocations.push(location)
            }
        }
    }

    if (safeCellsLocations.length === 0) return

    const ranIdx = getRandomInt(0,safeCellsLocations.length)
    const radLocation = safeCellsLocations[ranIdx]
    console.log(radLocation)
    const elCell = document.querySelector(`.cell-${radLocation.i}-${radLocation.j}`)
    elCell.classList.add('safe-cell')
    gSafeClicksLeft--
    const elSafeClick = document.querySelector('.safe-click span')
    elSafeClick.innerText = gSafeClicksLeft
    
    setTimeout(() => {
        elCell.classList.remove('safe-cell')
    }, 1000);

}