const express = require('express');
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const PORT = 3000

app.use(express.static('public'))


app.route('/')
.get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html')
})

app.route('/game')
.get((req, res) => {
    res.sendFile(process.cwd() + '/views/game.html')
})







app.use((req, res, next) => {
    res.status(404).type('text').send('Not found')
})

http.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
})