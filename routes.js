const passport = require('passport');
const bcrypt = require('bcrypt');
module.exports = (app, userDataBase) => {
    function ensureAuthenticated(req, res, next) {
        if(req.isAuthenticated()) return next();
        res.redirect('/');
    }

    app.route('/')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/login.html')
    })

    app.route('/game-directory')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/index.html')
    })

    app.route('/platformer')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/game.html')
    })




    app.route('/login')
    .post(passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
        console.log(`${req.body.username} has logged in`);
        res.redirect('/game-directory');
    })

    app.route('/register')
    .post((req, res, next) => {
        userDataBase.findOne({username: req.body.username}).then(user => {
            if(user) {
                console.log('user already exists, redirecting to login page');
                res.redirect('/')
            } else {
                userDataBase.insertOne({username: req.body.username, password: bcrypt.hashSync(req.body.password, 12)}).then(data => {
                    console.log('registered user');
                    console.log(data);
                    next(null, {
                        username: req.body.username,
                        password: req.body.password
                    })
                }).catch(err => {
                    console.error(err);
                    res.redirect('/')
                })
            }
        }).catch(err => {
            console.error(err);
            next(err);
        })
    },
    passport.authenticate('local', {failureRedirect: '/'}),
    (req, res) => {
        console.log('registered & authenticated');
        res.redirect('/game-directory');
    })




    app.use((req, res, next) => {
        res.status(404).type('text').send('Not Found')
    })
}
