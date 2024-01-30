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
const routes = require('./routes.js')
const auth = require('./auth.js')
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

})
routes(app, userDataBase, io);
auth(userDataBase);





http.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
})