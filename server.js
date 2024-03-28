require('dotenv').config();
let express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const passport = require('passport');
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.URI)
const session = require('express-session')
const MongoStore = require('connect-mongo');
const routes = require('./routes.js');
const auth = require('./auth.js');
let pongBallLogic = require('./pongBallServerLogic.js');
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.URI
    }),
    cookie: {secure: false},
    sameSight: 'strict',
    key: 'express.sid'
})
client.connect();
const userDataBase = client.db('game-users').collection('users');


app.use(express.static('public'))

app.use(sessionMiddleware)
app.use(express.json());
app.use(express.urlencoded({extended: true}))

const wrap = middleware =>  (socket, next) => middleware(socket.request, {}, next)
io.use(wrap(sessionMiddleware))
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

app.use(passport.initialize())
app.use(passport.session());

let pongRoomId = 1;
let pongRooms = {

}


io.on('connection', socket => {
    console.log('user connection lul');
    socket.on('update top score', ({username, topScore}) => {
        userDataBase.findOne({username: username}).then(user => {
            if(user) {
                userDataBase.updateOne({username: username}, {$set: {
                    platformer: {
                        topScore: topScore
                    }
                }}).then(data => {
                    console.log('updated top score of ' + username)
                }).catch(err => {
                    console.error(err)
                })
            } else {
                console.log('user does not exist, how tf are you even playing? lul')
            }
        }).catch(err => {
            console.error(err);
        })
    })

    socket.on('top score data', data => {
        console.log('why')
    })

    socket.on('get top score platformer', username => {
        userDataBase.findOne({username}).then(user => {
            if(user) {
                console.log('sending client topscore')
                socket.emit('top score from db', user.platformer.topScore)
            } else {
                console.log('user doesnt exist')
                socket.emit('top score from db', null);
            }
        })
    })

    // pong

    socket.on('request pong room', () => {
        // first check current pongRoomId number and see if a room exists with that id
        if(pongRoomId in pongRooms) {
            // room exists already, check capacity
            
            if(pongRooms[pongRoomId].players < 2) {
                // join room
                pongRooms[pongRoomId].players++;
                
            } else {
                // room is full
                // create new one
                pongRoomId++;
                pongRooms[pongRoomId] = {
                    players: 1
                }
                
            }
        } else {
            // room simply doesn't exist
            pongRoomId++;
            pongRooms[pongRoomId] = {
                players: 1
            }
            
        }
        socket.join(pongRoomId);
        socket.roomId = pongRoomId;
        io.to(pongRoomId).emit('player joined', pongRooms[pongRoomId].players);
    })

    socket.on('player moved', ({playerId, curPos}) => {
        io.to(socket.roomId).emit('update player position', {id: playerId, pos: curPos})
    })

    socket.on('start countdown pong', () => {
        let interval;
        let count = 3;
        interval = setInterval(() => {
            if(count == 0) {
                clearInterval(interval)
                return;
            }
            count--;
            io.to(socket.roomId).emit('update countdown');
            
        }, 1000);
        // setTimeout(() => {
        //     io.to(socket.roomId).emit('update countdown')
        //     setTimeout(() => {
        //         io.to(socket.roomId).emit('update countdown')
        //         setTimeout(() => {
        //             io.to(socket.roomId).emit('update countdown')
        //         }, 1000);
        //     }, 1000);
        // }, 1000);
    })

    socket.on('start game', () => {
        pongBallLogic(socket, io);
    })

    socket.on('update win loss pong', ({username, type}) => {
        userDataBase.findOne({username}).then(user => {
            if(user) {
                let curWins = type === "win" ? user.pong.wins + 1 : user.pong.wins;
                let curLosses = type === "loss" ? user.pong.losses + 1 : user.pong.losses;
                userDataBase.updateOne({username}, {$set: {
                    pong: {
                        wins: curWins,
                        losses: curLosses
                    }
                }}).then(d => {
                    console.log('updated win loss of ' + user.username);
                }).catch(err => {
                    console.error(err);
                })
            } else {
                console.log('user doesnt exist to update pong db 4shrug');
            }
        }).catch(err => {
            console.error(err);
        }) 
    })

    socket.on('update snake highscore', ({username, highScore}) => {
        userDataBase.findOne({username}).then(user => {
            if(user) {
                userDataBase.updateOne({username}, {$set: {
                    snake: {
                        highscore: highScore
                    }
                }}).then(d => {
                    console.log('updated highscore of ' + user.username);
                }).catch(err => {
                    console.error(err);
                })
            } else {
                console.log('user dont exist cuh');
            }
        }).catch(err => {
            console.error(err);
        })
    })

    socket.on('requesting snake highscore', username => {
        userDataBase.findOne({username}).then(user => {
            if(user) {
                
                if(user.snake) {
                    console.log('sent highscore data to ' + username);
                    socket.emit('snake highscore', user.snake.highscore);
                }
                
            } else {
                console.log('user doesnt exist, cannot send highscore for ' + username);
            }
        }).catch(err => {
            console.error(err);
        })
    })
})
routes(app, userDataBase, io);
auth(userDataBase);





http.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
})