module.exports = (socket, io) => {
    let screenWidth = 800;
    let screenHeight = 947;
    let puckSpeed = 9;
    let interval = 25;
    let puckWidth = 40;
    let puckHeight = 40;
    // we'll just keep track of the position using coordinates based on the gamescreen width and height
    // lets do coordinates from the top left tho to make it easier to translate

    io.to(socket.roomId).emit('set up game');

    // first we'll get the random direction in a range pi/6 to pi/3
    // then we'll generate a random number to determine the full direction
    // < .25 -> bottom left, < .5 -> bottom right, < .75 -> top right, < 1 -> top left :)
    let angle = Math.random() * Math.PI / 6 + Math.PI / 6;
    let dir = Math.random();
    let xDir = dir < .25 || dir >= .75 ? -1 : 1;
    let yDir = dir < .5 ? -1 : 1;
    let puckVelocity = [puckSpeed * Math.cos(angle) * xDir, puckSpeed * Math.sin(angle) * yDir];
    let puckPos = [screenWidth / 2 - puckWidth / 2, screenHeight / 2 - puckHeight / 2];
    // lets not overcomplicate the movement at first, we can change it later if we want
    // for now im just going to implement the movement so that the ball has 4 possible directions it can move in
    let randomX = Math.random() - 0.5;
    let randomY = Math.random() - 0.5;
    // if(randomX <= 0) {
    //     // start ball moving left
    //     puckVelocity[0] *= -1
    // }
    // if(randomY <= 0) {
    //     puckVelocity[1] *= -1;
    // }

    // initial velocity set up

    
    socket.on('collision', (type) => {
        if(type == 1) {
            puckVelocity[1] *= -1;
        } else {
            puckVelocity[0] *= -1;
        }
        
    })

    let gameInterval;
    gameInterval = setInterval(() => {
        puckPos[0] += puckVelocity[0];
        puckPos[1] += puckVelocity[1];
        if(puckPos[0] <= 0) {
            puckVelocity[0] *= -1;
            puckPos[0] = 0;
        } else if(puckPos[0] >= screenWidth - puckWidth) {
            puckVelocity[0] *= -1;
            puckPos[0] = screenWidth - puckWidth;
        }
        if(puckPos[1] + puckHeight >= screenHeight) {
            socket.removeAllListeners('collision');
            io.to(socket.roomId).emit('player scored', 2);
            clearInterval(gameInterval);
            // p2 scored
        } else if(puckPos[1] <= 0) {
            // p1 scored
            socket.removeAllListeners('collision');
            io.to(socket.roomId).emit('player scored', 1);
            clearInterval(gameInterval);
        }


        io.to(socket.roomId).emit('update ball position', puckPos);
        
        
    }, interval);

    
}   