let canvas = document.getElementById('game-window');
let c = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;
// remember the 50px buffer for the ui bar :)

// ui bar line
// ************** 
c.beginPath();
c.moveTo(0, 50);
c.lineTo(800, 50);
c.strokeStyle = 'white';
c.stroke();
// **************

// document assignments
let pressToStart = document.getElementById('press-to-start');
let scoreEl = document.getElementById('score');

// game variables
let fps = 1;
const rows = 12;
const cols = 16;
const cellWidth = width / cols;
const cellHeight = (height - 50) / rows;
let grid = [];
/*
    This grid will represent the board with the following states:
    0 - blank cell
    1 - snake cell
    2 - coin cell
*/
 
// initialize board to have all 0's
initBoard();

let center = [Math.floor(cols / 2), Math.floor(rows / 2)];
let snake = [[center[0], center[1]], [center[0] + 1, center[1]]]; // head of snake set to middle of board along with one body piece
let dir = 0;
/*
    Directions:
    -1 - stopped
    0 - left
    1 - up
    2 - right 
    3 - down
*/
let score = 0;
let highScore = 0; // we'll implement the db search for high score at some point



document.addEventListener('keypress', (e) => {
    if(dir != -1) {
        switch(e.key) {
            case 'w':
            case 'ArrowUp':
                dir = 1;
                break;
            case 'a':
            case 'ArrowLeft':
                dir = 0;
                break;
            case 's':
            case 'ArrowDown':
                dir = 3;
                break;
            case 'd':
            case 'ArrowRight':
                dir = 2;
                break;
        }
    }
    
})



let state = -1; // pregame state
let count = 0;
function draw() {
    setTimeout(() => {
        requestAnimationFrame(draw);
        // states
        if(state == -1) {
            // pregame state
            // press button to switch state (will be handled outside of this function)
            // display Press any key to start text
            // reset game so that snake is of length 3, and score is 0
            // snake should be in the middle of the screen going left
            pressToStart.style.visibility = 'visible';
            updateScore(0);
            // console.log('snake b4 update');
            // let s = '';
            // for(let i = 0; i < snake.length; i++) {
            //     s += '('
            //     s += snake[i][0] + ', ' + snake[i][1] + '), ';
            // }
            // console.log(s);
            if(dir != -1) {
                updateSnake();
            }
            if(count < 2) {
                growSnake();
                count++;
            }
            
            
            displayGrid();
        } else if(state == 0) {
            // play state
            // "Press any key to start" text should be gone, and game should be running
            // put game logic functions in here

        }
    }, 1000 / fps)
    
}
draw();


// draws rectangle with coordinates as top left corner :)
function drawRect(x, y, w, h, color="white") {
    c.beginPath();
    c.rect(x, y, w, h);
    c.fillStyle = color;
    c.fill();
}

function updateScore(s) {
    score = s;
    scoreEl.innerHTML = s;
}

function initBoard() {
    for(let i = 0; i < cols; i++) {
        grid.push([]);
        for(let j = 0; j < rows; j++) {
            grid[i].push(0);
        }
    }
}

function updateSnake() {
    let tailX = snake[snake.length - 1][0];
    let tailY = snake[snake.length - 1][1];
    for(let i = snake.length - 1; i >= 0; i--) {
        
        if(i == 0) {
            // snake head, change pos based on dir
            // console.log('head changing, prev head pos is (' + snake[0][0] + ', ' + snake[0][1]);
            switch(dir) {
                case 0:
                    // left
                    // if(snake[i][0] > 0) {
                    //     snake[i][0]--;
                    // }
                    snake[i][0]--;
                    break;
                case 1:
                    // up
                    // if(snake[i][1] > 0) {
                    //     snake[i][1]--;
                    // }
                    snake[i][1]--;
                    break;
                case 2:
                    // right
                    // if(snake[i][0] < cols - 1) {
                    //     snake[i][0]++;
                    // }
                    snake[i][0]++;
                    break;
                case 3: 
                    // down
                    // if(snake[i][1] < rows - 1) {
                    //     snake[i][1]++;
                    // }
                    snake[i][1]++;
                    break;
            }
            
            // check if out of bounds or touching leSnake body
            if(snake[0][0] < 0 || snake[0][0] > cols - 1 || snake[0][1] < 0 || snake[0][1] > rows - 1) {
                // is out of bounds
                dir = -1;
            }
            for(let i = 1; i < snake.length; i++) { 
                if(snake[0][0] == snake[i][0] && snake[0][1] == snake[i][1]) {
                    dir = -1;
                }
            }
            // console.log('moving head to (' + snake[0][0] + ', ' + snake[0][1] + ')');
        } else {
            // snake body, change pos to i - 1 pos
            // console.log('moving body piece from (' + snake[i][0] + ', ' + snake[i][1] + ') to (' + snake[i - 1][0] + ', ' + snake[i - 1][1] + ')');
            // snake[i] = snake[i - 1];
            if(snake[i][0] !== snake[i - 1][0] || snake[i][1] !== snake[i - 1][1]) {
                snake[i][0] = snake[i - 1][0];
                snake[i][1] = snake[i - 1][1];
            }
           
            
        }
    }
    if(dir != -1) {
        grid[tailX][tailY] = 0;
        for(let i = 0; i < snake.length; i++) {
            grid[snake[i][0]][snake[i][1]] = 1;
        }
    }
    

}

function growSnake() {
    snake.push([snake[snake.length - 1][0], snake[snake.length - 1][1]]) // this might work
}

function displayGrid() {
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            switch(grid[i][j]) {
                case 0:
                    // blank
                    c.clearRect(i * cellWidth, j * cellHeight + 50, cellWidth, cellHeight);
                    break;
                case 1:
                    drawRect(i * cellWidth, j * cellHeight + 50, cellWidth, cellHeight);
                    // snake body
                    break;
                case 2: 
                    // coin
                    break;
            }
        }
    }
}

function resetGame() {
    updateScore(0);
    initBoard();
}

