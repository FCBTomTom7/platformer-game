let socket = io("http://localhost:3000");
let players = []; // it will be [1] at first, then when the second player joins it will be [1, 2]
// or if this is the second player, it will only ever be [2]
let playerId; 
let gameInterval;
let interval = 20;
let paddleSpeed = 10;
const playerWidth = 250;
const playerHeight = 35;
let player = document.getElementById('player')
let opponent = document.getElementById('opponent')
let curPos = window.innerWidth / 2 - playerWidth / 2;
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
    if(curPos <= 0) { // imma do this check so there's no weird snapping
        curPos = 0;
    } else if(curPos >= window.innerWidth - playerWidth) {
        curPos = window.innerWidth - playerWidth;
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
})
socket.on('update player position', ({id, pos}) => {
    if(playerId != id) { // the player is the oponent, update it
        let newPos = window.innerWidth - playerWidth - pos;
        opponent.style.left = "".concat(newPos).concat('px'); // tmp
    }
})