let platformerGameButton = document.getElementById('platformer-img');
let pongGameButton = document.getElementById('pong-img');
let username = window.location.search.split('?')[1].split('username=')[1]
platformerGameButton.addEventListener('click', () => {
    window.location.replace('/platformer?username=' + username)
})

pongGameButton.addEventListener('click', () => {
    window.location.replace('/pong?username=' + username)
})