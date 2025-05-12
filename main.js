// get DOM elements
const sudokuBoard = document.querySelector('[data-sudoku-board]')
const solveButton = document.querySelector('[data-solve-button]')
const resetButton = document.querySelector('[data-reset-button]')
const generatePuzzleButton = document.querySelector('[data-generate-puzzle-button]')

// initialize sudoku grid
const sudokuGrid = new Array(9).fill().map(() => new Array(9).fill(''))

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
            const boxIdx = Math.floor(i / 3) * 3 + Math.floor(j / 3)
            if (boxIdx % 2 == 1) {
                cell.classList.add('cell2')
            }

            sudokuBoard.appendChild(cell)
        }
    }
}

// define function to check if a sudoku grid is valid
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

// define function to check if grid is filled
function isGridFilled(grid) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] == '') return false
        }
    }
    return true
}

// define function to find next cell that is not already occupied by a number
function findNextEmptyCell(grid) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] == '') {
                return [i, j]
            }
        }
    }
    return null
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
function renderSudokuGrid(solve=true) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (solve && sudokuGrid[i][j] !== '')
                renderCell(i, j, sudokuGrid[i][j], 'correct')
            else
                renderCell(i, j, sudokuGrid[i][j])
        }
    }
}

// define function to solve sudoku board with animation
let animationCounter = 0
async function solveSudoku() {
    // if board is filled: return true
    const nextCell = findNextEmptyCell(sudokuGrid)
    if (!nextCell) return true

    // find next empty cell
    const [row, col] = nextCell

    // try numbers 1-9
    for (let number = 1; number <= 9; number++) {
        sudokuGrid[row][col] = number
        renderCell(row, col, sudokuGrid[row][col], 'correct') // green

        // delay render updates occasionally to see backtracking process
        animationCounter++
        if (animationCounter % 110 == 0) {
            await new Promise(resolve => setTimeout(resolve))
        }

        if (isValidGrid(sudokuGrid)) {
            const solved = await solveSudoku()
            if (solved) return true
        }

        renderCell(row, col, sudokuGrid[row][col], 'wrong') // red
        if (animationCounter % 110 == 0) {
            await new Promise(resolve => setTimeout(resolve, 20))
        }

        sudokuGrid[row][col] = ''

        renderCell(row, col, sudokuGrid[row][col]) // normal
        if (animationCounter % 110 == 0) {
            await new Promise(resolve => setTimeout(resolve))
        }
    }

    return false
}

// define function to reset sudoku grid
function resetSudokuGrid() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            sudokuGrid[i][j] = ''
        }
    }
}

// define function to reset sudoku board in DOM
function resetSudokuBoard() {
    cells.forEach(cell => {
        cell.value = ''
        cell.classList.remove('correct-cell')
        cell.classList.remove('wrong-cell')
    })
}

// define function to randomly shuffle an array
// source: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffleArray(array) {
    let curIdx = array.length

    while (curIdx != 0) {
        const randIdx = Math.floor(Math.random() * curIdx--)
        const temp = array[curIdx]
        array[curIdx] = array[randIdx]
        array[randIdx] = temp
    }
    return array
}

// define function to check if placing a number in a cell results in a valid sudoku grid
function isValidCell(row, col, val, rows, cols, boxes) {
    const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3)
    return !rows[row][val] && !cols[col][val] && !boxes[boxIdx][val]
}

// define function to solve an empty sudoku grid with an aspect of randomness
const possibleNums = [1,2,3,4,5,6,7,8,9]
function solveSudokuRandom(rows, cols, boxes) {
    const nextCell = findNextEmptyCell(sudokuGrid)
    if (!nextCell) return true

    const [row, col] = nextCell
    const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3)

    for (const number of shuffleArray([...possibleNums])) {
        if (isValidCell(row, col, number, rows, cols, boxes)) {
            sudokuGrid[row][col] = number
            rows[row][number] = true
            cols[col][number] = true
            boxes[boxIdx][number] = true

            if (solveSudokuRandom(rows, cols, boxes)) {
                return true
            }

            sudokuGrid[row][col] = ''
            rows[row][number] = false
            cols[col][number] = false
            boxes[boxIdx][number] = false
        }
    }
    
    return false
}

// define function to check if a unique solution exists for the sudoku grid
let foundFirstSolution = false
function uniqueSolutionExists(rows, cols, boxes) {
    let numSolutions = 0

    function dfs() {
        if (numSolutions > 1) return

        const nextCell = findNextEmptyCell(sudokuGrid)
        if (!nextCell) {
            numSolutions++
            return
        }

        const [row, col] = nextCell
        const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3)

        for (let num = 1; num <= 9; num++) {
            if (!rows[row][num] && !cols[col][num] && !boxes[boxIdx][num]) {
                sudokuGrid[row][col] = num
                rows[row][num] = true
                cols[col][num] = true
                boxes[boxIdx][num] = true

                dfs()

                sudokuGrid[row][col] = ''
                rows[row][num] = false
                cols[col][num] = false
                boxes[boxIdx][num] = false
            }
        }
    }

    dfs()
    return numSolutions == 1
}

// define function to generate a random sudoku puzzle with a unique solution
// source: https://www.101computing.net/sudoku-generator-algorithm/
function generatePuzzle(attempts) {
    resetSudokuGrid()
    resetSudokuBoard()
    const rows = new Array(9).fill().map(() => new Array(10).fill(false))
    const cols = new Array(9).fill().map(() => new Array(10).fill(false))
    const boxes = new Array(9).fill().map(() => new Array(10).fill(false))
    solveSudokuRandom(rows, cols, boxes)

    while (attempts > 0) {
        // select random cell that is not already empty
        let row = Math.floor(Math.random() * 9)
        let col = Math.floor(Math.random() * 9)
        while (sudokuGrid[row][col]  == '') {
            row = Math.floor(Math.random() * 9)
            col = Math.floor(Math.random() * 9)
        }
        const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3)

        // store its cell value in case we need to put it back
        prevVal = sudokuGrid[row][col]
        sudokuGrid[row][col] = ''
        rows[row][prevVal] = false
        cols[col][prevVal] = false
        boxes[boxIdx][prevVal] = false

        const isUniqueSolution = uniqueSolutionExists(rows, cols, boxes)
        if (!isUniqueSolution) {
            sudokuGrid[row][col] = prevVal
            rows[row][prevVal] = true
            cols[col][prevVal] = true
            boxes[boxIdx][prevVal] = true
            attempts--
        }
    }

    renderSudokuGrid(solve=false)
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
    await solveSudoku()
})

// reset sudoku board when reset button is clicked
resetButton.addEventListener('click', () => {
    resetSudokuGrid()
    resetSudokuBoard()
})

// generate a random sudoku puzzle when generate puzzle button is clicked
generatePuzzleButton.addEventListener('click', () => {
    generatePuzzle(attempts=9)
})