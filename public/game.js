let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
const platformSpeed = 5;
// console.log(screenHeight)
addEventListener('resize', () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
})

let platforms = document.querySelectorAll('.platform')

startGame();
function update() {
    movePlatformsLeft();
}


function startGame() {
    setUp();
    setInterval(update, 40)
}

function setUp() {
    positionPlatforms();
}



function positionPlatforms() {
    // first lets figure out the positions and heights we want these shits at
    // i want at most 100 px between platforms, given worst case scenario of random generator
    
    platforms.forEach((platform, i) => {
        console.log(platform, i);
        
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
    let height = Math.floor(Math.random() * 100 + 300)
    let top = screenHeight - height;
    platform.style.width = '' + width + 'px'
    platform.style.height = '' + height + 'px'
    platform.style.top = '' + top + 'px'
}




