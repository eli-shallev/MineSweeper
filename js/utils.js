'use strict'
var gCellId = 0

function createCell() {
    const cell = {
        id: gCellId++,
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    return cell
}

function renderBoard(mat, selector) {
    var strHTML = ''
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`

            const cellId = (i * mat.length + j)

            var cellContent
            if (cell.isShown) {
                cellContent = (cell.isMine) ? MINE : cell.minesAroundCount
            } else {
                cellContent = (cell.isMarked) ? FLAG : ''
            }
            if (cellContent===0) cellContent=''

            strHTML += `<td onClick="cellClicked(this)" class="${className}" id="${cellId}" data-i="${i}" data-j="${j}">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML

    const elCells = document.querySelectorAll('.cell')
    for(var i = 0; i<elCells.length; i++){
        const elCell = elCells[i]

        elCell.oncontextmenu = (e) => {
            e.preventDefault()
            cellMarked(elCell)
        }
    
    }
    
}

function renderCell(location) {
    var cellContent
    const cell = gBoard[location.i][location.j]

    if (cell.isShown) {
        cellContent = (cell.isMine) ? MINE : cell.minesAroundCount
    } else {
        cellContent = (cell.isMarked) ? FLAG : ''
    }
    if (cellContent===0) cellContent=''
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerText = cellContent
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)  // The maximum is exclusive and the minimum is inclusive
}