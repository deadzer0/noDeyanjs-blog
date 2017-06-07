var LocalStrategy = require ('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bearerStrategy = require('passport-http-bearer').Strategy;

// model
var User = require ('../model/users');

// google and facebook data
var configAuth = require('../config/auth');


module.exports = function (passport) {

    // serialize
    passport.serializeUser(function (user, done) {
        done(null, user.id)
    });

    // deserialize
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

    // local signup
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done){
            process.nextTick(function(){
                User.findOne({'local.username': email}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){
                        return done(null, false, req.flash('signupMessage', 'That email already taken'));
                    } else {
                        var newUser = new User();
                        newUser.local.username = email;
                        newUser.local.password = newUser.generateHash(password); // bcrypt custom method to gen. salt

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        })
                    }
                })

            });
        }));

    //local login strategy
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done){
            process.nextTick(function(){
                User.findOne({ 'local.username': email}, function(err, user){
                    if(err)
                        return done(err);
                    if(!user)
                        return done(null, false, req.flash('loginMessage', 'No User found!'));
                    if(!user.comparePassword(password)){    // compare password
                        return done(null, false, req.flash('loginMessage', 'Invalid password!'));
                    }
                    return done(null, user);

                });
            });
        }
    ));

    //facebook login strategy
    passport.use(new facebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: [ 'email' , 'name' ]
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
                User.findOne({'facebook.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user)
                        return done(null, user);
                    else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                        console.log(profile);
                    }
                });
            });
        }

    ));

    //google login strategy
    passport.use(new googleStrategy({
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            profileFields: [ 'email' , 'name' ]                     /// check this !!!!
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
                User.findOne({'google.id': profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user)
                        return done(null, user);
                    else {
                        var newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = accessToken;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                        console.log(profile);
                    }
                });
            });
        }
    ));

    //api bearer strategy
    passport.use(new bearerStrategy(
        function(token, done) {
            User.findOne({ _id: token }, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user, { scope: 'all' });
            });
        }
    ));
};
