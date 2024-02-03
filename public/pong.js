let socket = io("http://localhost:3000");
let players = []; // it will be [1] at first, then when the second player joins it will be [1, 2]
// or if this is the second player, it will only ever be [2]
let playerId; 
let gameInterval;
let interval = 20;
let paddleSpeed = 10;
let puckWidth = 40;
let puckHeight = 40;
const playerWidth = 250;
const playerHeight = 35;
let screenWidth = 1250;
console.log(window.innerHeight);
let rightEdge = screenWidth + ((window.innerWidth - screenWidth) / 2);
let leftEdge = (window.innerWidth - screenWidth) / 2;
let player = document.getElementById('player');
let opponent = document.getElementById('opponent');
let puck = document.getElementById('puck')
let leftCountdown = document.getElementById('left-counter');
let rightCountdown = document.getElementById('right-counter');
let countValue = 3;
let curPos = window.innerWidth / 2 - playerWidth / 2;
let puckLeft = window.innerWidth / 2 - puckWidth / 2;
let puckTop = window.innerHeight / 2 - puckHeight / 2;
let oppPos = curPos;

window.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft') {
        move(-1);
        socket.emit('player moved', {
            playerId,
            curPos
        })
    } else if(e.key === "ArrowRight") {
        move(1);
        socket.emit('player moved', {
            playerId,
            curPos
        })
    }
})


function play() {
    gameInterval = setInterval(() => {
        update()
    }, interval);    
}

function update() {

}

function move(dir) {
    curPos += dir * paddleSpeed;
    if(curPos <= leftEdge) { // imma do this check so there's no weird snapping
        curPos = leftEdge;
    } else if(curPos >= rightEdge - playerWidth) {
        curPos = rightEdge - playerWidth;
    }
    player.style.left = "".concat(curPos).concat('px');
    
}








// socket initialization
socket.emit('request pong room')
socket.on('player joined', playerCount => {
    // imma make the playercount the id of this player on the client
    // this is so i can keep track of which player is moving on the server side :o
    players.push(playerCount)
    playerId = players.indexOf(1) == -1 ? 2 : 1; // if 1 is not present in the players array, then this must be player 2
    // also put like a waiting for other player when the playercount is 1
    console.log(players);
    console.log(playerId);
    if(playerCount == 2) {
        leftCountdown.style.visibility = 'visible';
        rightCountdown.style.visibility = 'visible';
        leftCountdown.innerHTML = countValue;
        rightCountdown.innerHTML = countValue;
        countValue = 3;
        if(playerId == 1) {
            // player is host, it will initiate the start game sequence
            socket.emit('start countdown pong');
            
            
        }
    }
    
})
socket.on('update player position', ({id, pos}) => {
    if(playerId != id) { // the player is the oponent, update it
        let newPos = window.innerWidth - playerWidth - pos;
        opponent.style.left = "".concat(newPos).concat('px'); // tmp
    }
})

socket.on('update countdown', () => {
 // im just keeping track of the count to avoid sending unnecessary data over the socket
    countValue--;
    if(countValue == 0) {
        leftCountdown.style.visibility = 'hidden';
        rightCountdown.style.visibility = 'hidden';
        if(playerId == 1) {
            socket.emit('start game');
        }
        
    }
    leftCountdown.innerHTML = countValue;
    rightCountdown.innerHTML = countValue;
})

socket.on('set up game', () => {
    curPos = window.innerWidth / 2 - playerWidth / 2;
    puckLeft = window.innerWidth / 2 - puckWidth / 2;
    puckTop = window.innerHeight / 2 - puckHeight / 2;
    player.style.left = ''.concat(curPos).concat('px');
    puck.style.left = ''.concat(puckLeft).concat('px');
    puck.style.top = ''.concat(puckTop).concat('px');
    socket.emit('player moved', {playerId, curPos})
})

socket.on('update ball position', puckPos => {
    // need to translate position based on which player the client is
    let translatedLeft;
    let translatedTop;
    if(playerId == 1) {
        translatedLeft = ((window.innerWidth - screenWidth) / 2) + puckPos[0];
        translatedTop = puckPos[1];
    } else {
        translatedLeft = window.innerWidth - ((window.innerWidth - screenWidth) / 2) - puckPos[0];
        translatedTop = window.innerHeight - puckPos[1];
    }
    puck.style.left = "".concat(translatedLeft).concat('px');
    puck.style.top = "".concat(translatedTop).concat('px');
})