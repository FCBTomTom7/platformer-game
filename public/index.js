let platformerGameButton = document.getElementById('platformer-img');
let pongGameButton = document.getElementById('pong-img');
let snakeGameButton = document.getElementById('snake-img');
let usernameEl = document.getElementById('username');
let username = window.location.search.split('?')[1].split('username=')[1];

usernameEl.innerHTML = username;

platformerGameButton.addEventListener('click', () => {
    window.location.replace('/platformer?username=' + username)
})

pongGameButton.addEventListener('click', () => {
    window.location.replace('/pong?username=' + username)
})

snakeGameButton.addEventListener('click', () => {
    window.location.replace('/snake?username=' + username)
})