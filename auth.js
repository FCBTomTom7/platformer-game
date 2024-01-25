const LocalStrategy = require('passport-local');
const passport = require('passport');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
module.exports = (userDataBase) => {

    const localStrategy = new LocalStrategy((username, password, cb) => {
        userDataBase.findOne({username: username}).then(user => {
            console.log(`${username} attempted to log in`);
            if(!user) return cb(null, false)
            if(!bcrypt.compareSync(password, user.password)) return cb(null, false)
            return cb(null, user);
        }).catch(err => {
            return cb(err);
        })
    })
    passport.use(localStrategy);



    passport.serializeUser((user, done) => {   
        done(null, user._id);
      })
    
      passport.deserializeUser((id, done) => { 
        userDataBase.findOne({_id: new ObjectId(id)}).then(doc => {
            done(null, doc)
        }).catch(err => {
            console.error(err);
        })
      }) 
}