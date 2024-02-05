module.exports = (socket, io) => {
    let screenWidth = 800;
    let screenHeight = 947;
    let puckSpeed = 6;
    let interval = 25;
    let puckWidth = 40;
    let puckHeight = 40;
    // we'll just keep track of the position using coordinates based on the gamescreen width and height
    // lets do coordinates from the top left tho to make it easier to translate

    io.to(socket.roomId).emit('set up game');

    let puckVelocity = [puckSpeed, puckSpeed];
    let puckPos = [625, 473];
    // lets not overcomplicate the movement at first, we can change it later if we want
    // for now im just going to implement the movement so that the ball has 4 possible directions it can move in
    let randomX = Math.random() - 0.5;
    let randomY = Math.random() - 0.5;
    if(randomX <= 0) {
        // start ball moving left
        puckVelocity[0] *= -1
    }
    if(randomY <= 0) {
        puckVelocity[1] *= -1;
    }

    // initial velocity set up

 
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
            socket.off('collision', (...args) => {
                
            })
            io.to(socket.roomId).emit('player scored', 2);
            clearInterval(gameInterval);
            // p2 scored
        } else if(puckPos[1] <= 0) {
            // p1 scored
            socket.off('collision', (...args) => {
                
            })
            io.to(socket.roomId).emit('player scored', 1);
            clearInterval(gameInterval);
        }


        io.to(socket.roomId).emit('update ball position', puckPos);
        
        
    }, interval);


    socket.on('collision', () => {
        puckVelocity[1] *= -1;
    })

}   