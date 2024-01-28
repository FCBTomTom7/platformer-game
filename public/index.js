let gameButton = document.getElementById('to-game-button');
let username = window.location.search.split('?')[1].split('username=')[1]
gameButton.addEventListener('click', () => {
    window.location.replace('/platformer?username=' + username)
})