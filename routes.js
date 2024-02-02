const passport = require('passport');
const bcrypt = require('bcrypt');
module.exports = (app, userDataBase, io) => {
    function ensureAuthenticated(req, res, next) {
        if(req.isAuthenticated()) return next();
        res.redirect('/');
    }

    app.route('/')
    .get((req, res) => {
        res.sendFile(process.cwd() + '/views/login.html')
    })

    app.route('/game-directory')
    .get(ensureAuthenticated, (req, res) => {
        res.sendFile(process.cwd() + '/views/index.html')
    })

    app.route('/platformer')
    .get(ensureAuthenticated, (req, res) => {
        // we first want to check if user has data in this game already
        let username = req.user.username;
        let password = req.user.password;
        userDataBase.findOne({username: username, password: password}).then(user => {
            if(!user.platformer) {
                userDataBase.updateOne({username: username, password: password}, {$set: {
                    platformer: {
                        topScore: 0
                    }
                }}).then(data => {
                    console.log('added platformer section to ' + username);
                }).catch(err => {
                    console.error(err);
                }) 
            } 
                // create section in user database for platformer data
                
            
        }).catch(err => {
            console.error(err);
        })
        res.sendFile(process.cwd() + '/views/game.html')
    })


    app.route('/pong')
    .get(ensureAuthenticated, (req, res) => {
        // we first want to check if user has data in this game already
        let username = req.user.username;
        let password = req.user.password;
        userDataBase.findOne({username: username, password: password}).then(user => {
            if(!user.pong) {
                userDataBase.updateOne({username: username, password: password}, {$set: {
                    pong: {
                        wins: 0,
                        losses: 0
                    }
                }}).then(data => {
                    console.log('added pong section to ' + username);
                }).catch(err => {
                    console.error(err);
                }) 
            } 
                // create section in user database for platformer data
                
            
        }).catch(err => {
            console.error(err);
        })
        res.sendFile(process.cwd() + '/views/pong.html')
    })

    app.route('/login')
    .post(passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
        console.log(`${req.body.username} has logged in`);
        res.redirect('/game-directory?username=' + req.body.username);
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
        res.redirect('/game-directory?username=' + req.body.username);
    })




    app.use((req, res, next) => {
        res.status(404).type('text').send('Not Found')
    })
}
