require('dotenv').config();
let express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const http = require('http').createServer(app)
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

app.use(passport.initialize())
app.use(passport.session());



routes(app, userDataBase);
auth(userDataBase);





http.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
})