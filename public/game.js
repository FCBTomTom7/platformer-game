let socket = io('http://localhost:3000');
let user = window.location.search.split('?')[1]?.split('username=')[1] || null
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let platformSpeed = 5;
let platformAcc = 0.001;
const gravity = 0.6;
const playerJump = -7;
const playerWidth = 45;
const playerHeight = 120;
const scoreIncrement = 0.2;
let gameInterval;
let score = 0;
let topScore = 0;
let playerVel = 0;
let startPos = screenHeight / 3;
let curPos = startPos;
let startOffset = 50;
let canJump = false;
let backButton = document.getElementById('back-button');
let platforms = document.querySelectorAll('.platform')
let player = document.getElementById('player');
let scoreEl = document.getElementById('score');
let topScoreEl = document.getElementById('top-score');
let pressToStart = document.getElementById('press-to-start');
let state = 0; 

// back button functionality
backButton.addEventListener('click', () => {
    window.location.replace('http://localhost:3000/game-directory?username=' + user);
})


// console.log(screenHeight)
addEventListener('resize', () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
})

addEventListener('keypress', (e) => {
   if(state == 0) {
    state = 1;
    pressToStart.style.visibility = 'hidden'
    setUp();
    startGame();
   }
    if(e.key === ' ') {
        if(canJump) {
            playerVel += playerJump;
        }
    }
})









// startGame();
setUp();
function update() {

   

    movePlatformsLeft();
    
    if(!canJump) {
        playerVel += gravity;
    }
    
    curPos += playerVel;
    
    // CHECK COLLISION HERE
    let collisionData = onGround();
    // console.log(collisionData);
    if(collisionData) {
        // console.log('we out here');
        let plat = collisionData[1]
        if(collisionData[2] == 1) {  // player on top of platform
            playerVel = 0;
            canJump = true;
            
            curPos = Number(plat.style.top.slice(0, -2)) - playerHeight;
        } else if(collisionData[2] == 2) { // player on side of platform
            let left = Number(plat.style.left.slice(0, -2)) - playerWidth;
            player.style.left = '' + left + 'px';
        }
        
        
        // do some sort of check to get top value of platform to set position properly
    }  else {
        canJump = false
    }
    player.style.top = '' + curPos + 'px'
    score += scoreIncrement;
    updateStats();
    checkGameOver();
}


function startGame() {
    //setUp();
    gameInterval = setInterval(update, 20)
}

function setUp() {
    score = 0;
    playerVel = 0;
    curPos = startPos;
    setPlayerStartPosition();
    positionPlatforms();
}

function setPlayerStartPosition() {
    player.style.top = '' + startPos + 'px'
    player.style.left = '' + startOffset + 'px'
}


function positionPlatforms() {
    // first lets figure out the positions and heights we want these shits at
    // i want at most 100 px between platforms, given worst case scenario of random generator
    
    platforms.forEach((platform, i) => {

        
        let left = i * (screenWidth / 3)
        setPlatformWidthAndHeight(platform);
        platform.style.left = '' + left + 'px'
        
    })
}

function movePlatformsLeft() {
    // console.log('cuh')
    
    platforms.forEach(platform => {
      let curLeft = platform.style.left.match(/\-?[0-9]+/)[0];
    //   console.log(curLeft);
      curLeft -= platformSpeed;
        
      if(curLeft <= screenWidth / -3) {
        curLeft = screenWidth
        setPlatformWidthAndHeight(platform)
        

      }  
      platform.style.left = '' + curLeft + 'px'
    })
    
    
}

function setPlatformWidthAndHeight(platform) {
    let minWidth = screenWidth / 3 - 100
    let width = Math.floor(Math.random() * 50  + minWidth)
    let height = Math.floor(Math.random() * 50 + 300)
    let top = screenHeight - height;
    platform.style.width = '' + width + 'px'
    platform.style.height = '' + height + 'px'
    platform.style.top = '' + top + 'px'
}

function onGround() {
    for(let i = 0; i < platforms.length; i++) {
        let platform = platforms[i]
        let platTop = Number(platform.style.top.slice(0, -2));
        let platLeft = Number(platform.style.left.slice(0, -2));
        let platWidth = Number(platform.style.width.slice(0, -2));
        // player dimensions are 45 x 120
        if(curPos + playerHeight >= platTop && platLeft < startOffset + playerWidth && platLeft + platWidth > startOffset) {
            // DO ADDITIONAL CHECK TO SEE IF ITS A SIDE TYPE OF COLLISION (only going to check left side, don't really see a need to check right)
            if(curPos + playerHeight >= platTop + 20) {
                // SIDE COLLISION
                return [true, platform, 2]
            }
            //console.log(curPos);
            return [true, platform, 1]
        }
    }
    
    
    return false;
}

function updateStats() {
    scoreEl.innerHTML = Math.floor(score);
}

function checkGameOver() {
    if(curPos > screenHeight || Number(player.style.left.slice(0, -2)) + playerWidth < 0) {
        handleGameOver();
    }
}

function handleGameOver() {
    console.log('game over!');
    state = 0;
    pressToStart.style.visibility = 'visible'
    clearInterval(gameInterval);
    if(score > topScore) {
        topScore = score;
        topScoreEl.innerHTML = Math.floor(topScore);
        socket.emit('update top score', {
            username: user,
            topScore: topScore
        })

    }
}

// IO BULLSHIT
socket.emit('get top score platformer', user)
socket.on('top score from db', ts => {
    if(ts) {
        topScore = ts;
        topScoreEl.innerHTML = Math.round(topScore);
    } else {
        topScore = 0;
        topScoreEl.innerHTML = 0; 
    }
    
})