// get DOM elements
const sudokuBoard = document.querySelector('[data-sudoku-board]')
const solveButton = document.querySelector('[data-solve-button]')

const sudokuGrid = [
    [5, 3, '', '', 7, '', '', '', ''],
    [6, '', '', 1, 9, 5, '', '', ''],
    ['', 9, 8, '', '', '', '', 6, ''],
    [8, '', '', '', 6, '', '', '', 3],
    [4, '', '', 8, '', 3, '', '', 1],
    [7, '', '', '', 2, '', '', '', 6],
    ['', 6, '', '', '', '', 2, 8, ''],
    ['', '', '', 4, 1, 9, '', '', 5],
    ['', '', '', '', 8, '', '', 7, 9]
]
// const sudokuGrid = new Array(9).fill().map(() => new Array(9).fill(''))

// define function to create sudoku board in DOM
function createSudokuBoard() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('input')
            cell.type = 'text'
            cell.maxLength = 1
            cell.classList.add('cell')
            cell.dataset.input = ''  // adds data-input to the input element
            cell.value = sudokuGrid[i][j]

            // add background color to alternating boxes
            const boxIdx = Math.floor(i / 3) + Math.floor(j / 3)
            if (boxIdx % 2 == 1) {
                cell.classList.add('cell2')
            }

            sudokuBoard.appendChild(cell)
        }
    }
}

// define function to update sudoku grid from user input
// function updateSudokuGrid() {
//     for (let i = 0; i < 9; i++) {
//         for (let j = 0; j < 9; j++) {
//             const cellIdx = i*9 + j
//             if (cells[cellIdx].value != '') sudokuGrid[i][j] = parseInt(cells[cellIdx].value, 10)
//         }
//     }
// }

// define function to check if sudoku grid is valid
// function isValidGrid(grid) {
//     const rows = Array.from({ length: 9 }, () => new Set())
//     const cols = Array.from({ length: 9 }, () => new Set())
//     const boxes = Array.from({ length: 9 }, () => new Set())
    
//     for (let i = 0; i < 9; i++) {
//         for (let j = 0; j < 9; j++) {
//             if (grid[i][j] == '') {
//                 continue
//             }

//             const boxIdx = Math.floor(i / 3) * 3 + Math.floor(j / 3)
//             if (rows[i].has(grid[i][j]) || cols[j].has(grid[i][j]) || boxes[boxIdx].has(grid[i][j])) { 
//                 return false
//             }

//             rows[i].add(grid[i][j])
//             cols[j].add(grid[i][j])
//             boxes[boxIdx].add(grid[i][j])
//         }
//     }

//     return true
// }
function isValidGrid(grid) {
    const rows = new Array(9).fill().map(() => new Array(10).fill(false))
    const cols = new Array(9).fill().map(() => new Array(10).fill(false))
    const boxes = new Array(9).fill().map(() => new Array(10).fill(false))
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] == '') {
                continue
            }

            const boxIdx = Math.floor(i / 3) * 3 + Math.floor(j / 3)
            if (rows[i][grid[i][j]] || cols[j][grid[i][j]] || boxes[boxIdx][grid[i][j]]) { 
                return false
            }

            rows[i][grid[i][j]] = true
            cols[j][grid[i][j]] = true
            boxes[boxIdx][grid[i][j]] = true
        }
    }

    return true
}
// console.log(isValidGrid(sudokuGrid))

// define function to check if grid is filled
function isGridFilled(grid) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] == '') return false
        }
    }
    return true
}

// define function to render cell
function renderCell(row, col, value, type='') {
    const cellIdx = row*9 + col
    cells[cellIdx].value = value
    if (type === 'correct') cells[cellIdx].classList.add('correct-cell')
    else if (type === 'wrong') cells[cellIdx].classList.add('wrong-cell')
    else {
        cells[cellIdx].classList.remove('correct-cell')
        cells[cellIdx].classList.remove('wrong-cell')
    }
}

// define function to render sudoku grid
function renderSudokuGrid() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudokuGrid[i][j] !== '')
                renderCell(i, j, sudokuGrid[i][j], 'correct')
            else
                renderCell(i, j, sudokuGrid[i][j])
        }
    }
}

let animationCounter = 0

// define function to solve sudoku board with animation
async function solveSudoku() {
    // if board is filled: return true
    if (isGridFilled(sudokuGrid)) return true

    // find next empty cell
    let row = 0
    let col = 0
    let isFound = false
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudokuGrid[i][j] === '') {
                row = i
                col = j
                isFound = true
                break
            }
        }
        if (isFound) break
    }

    // try numbers 1-9
    for (let number = 1; number <= 9; number++) {
        sudokuGrid[row][col] = number
        renderCell(row, col, sudokuGrid[row][col], 'correct') // green
        // await new Promise(resolve => setTimeout(resolve)) // delay after inserting number

        // delay render updates occasionally to see backtracking process
        animationCounter++
        if (animationCounter % 25 == 0) {
            await new Promise(resolve => setTimeout(resolve))
        }

        if (isValidGrid(sudokuGrid)) {
            const solved = await solveSudoku()
            if (solved) return true
        }

        renderCell(row, col, sudokuGrid[row][col], 'wrong') // red
        if (animationCounter % 25 == 0) {
            await new Promise(resolve => setTimeout(resolve))
        }

        sudokuGrid[row][col] = ''

        renderCell(row, col, sudokuGrid[row][col]) // normal
        if (animationCounter % 25 == 0) {
            await new Promise(resolve => setTimeout(resolve))
        }
        // await new Promise(resolve => setTimeout(resolve)) // delay after removing number
    }

    return false
}

// create sudoku board
createSudokuBoard()

// get cells from DOM
const cells = document.querySelectorAll('[data-input]')

// allow only digits 1-9 in the cells and update sudoku grid when user inputs
cells.forEach((cell, cellIdx) => {
    cell.addEventListener('input', () => {
        if (!/^[1-9]$/.test(cell.value)) {
            cell.value = ''
        } else {
            const row = Math.floor(cellIdx / 9)
            const col = cellIdx % 9
            sudokuGrid[row][col] = parseInt(cell.value, 10)
        }
    })
})

// solve sudoku board when solve button is clicked
solveButton.addEventListener('click', async () => {
    renderSudokuGrid()
    console.log(await solveSudoku())
    console.log(sudokuGrid)
    renderSudokuGrid() // render sudoku grid
})
// solveSudoku()
// console.log(sudokuGrid)
// solved = [
//     [5, 3, 4, 6, 7, 8, 9, 1, 2],
//     [6, 7, 2, 1, 9, 5, 3, 4, 8],
//     [1, 9, 8, 3, 4, 2, 5, 6, 7],
//     [8, 5, 9, 7, 6, 1, 4, 2, 3],
//     [4, 2, 6, 8, 5, 3, 7, 9, 1],
//     [7, 1, 3, 9, 2, 4, 8, 5, 6],
//     [9, 6, 1, 5, 3, 7, 2, 8, 4],
//     [2, 8, 7, 4, 1, 9, 6, 3, 5],
//     [3, 4, 5, 2, 8, 6, 1, 7, 9]
// ]
// console.log(isValidGrid(solved))

// index --> row, col
// row = index // 9
// col = index % 9

// row, col --> index
// index = row*9 + col

// TODO: button to generate unsolved board
// TODO: clear board button