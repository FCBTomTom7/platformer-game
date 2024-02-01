let pongGameButton = document.getElementById('platformer-img');
let username = window.location.search.split('?')[1].split('username=')[1]
pongGameButton.addEventListener('click', () => {
    window.location.replace('/platformer?username=' + username)
})