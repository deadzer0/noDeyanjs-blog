// require Models
var Article =   require('../model/articles');

// nodemailer
var nodemailer = require('nodemailer');
var debugMail = require('../config/mailer');

// async
var async = require('async');

module.exports = function (app, passport) {

    //*********************************** HOME route  *************************************
    app.get('/', function (req, res) {

        // Async way
        async.parallel({
            articleAFind: function (cb){ Article.find({}).sort({created_at: -1}).exec(cb); },
            articleBFind: function (cb){ Article.count({}).exec(cb); }
        }, function(err, result){
            var ret = result.articleAFind;
            ret.dataB = result.articleBFind;

            res.render('home', {'ret': ret});

        });
    });

    //*********************************** LOGIN routes *************************************
    // Local login routes
    app.get('/login', function(req, res){
        res.render('login', { message: req.flash('loginMessage') });
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup', function (req, res) {
       res.render('signup', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/profile', isLoggedIn, function(req, res){
        res.render('profile', { user: req.user });
        console.log(req.session.passport.user)
    });

    // Facebook login routes
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // Google login routes
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile','email']}));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // ARTICLES

    // CONTACTS
    app.get('/contact', function (req, res) {
       res.render('contact-form')
    });

    app.post('/contact', function (req, res) {

        // create reusable transporter object
        var transporter = nodemailer.createTransport({
            host: debugMail.debugIo.host,
            port: debugMail.debugIo.port,
            auth: {
                user: debugMail.debugIo.auth.user,
                pass: debugMail.debugIo.auth.pass
            }
        });

        // setup email data
        var email =req.body.email;
        var subject = req.body.subject;
        var message = req.body.message;

        // validation form
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('subject', 'Subject is required').notEmpty();
        req.checkBody('message', 'Message is required').notEmpty();

        var errors = req.validationErrors();

        if(errors){
            res.render('contact-form', {
                'errors': errors
            })
        } else {
            var mailOptions = {
                from: email, // sender address
                to: 'gendarmery@abv.bg', // list of receivers
                subject: subject, // Subject line
                text: message, // plain text body
                html: '<b>' + message + '</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return console.log(error);
                }
                if (info.rejected.length === 0){
                    console.log('Your message was send successfuly!');
                        res.redirect('/')
                } else {
                    res.send('Error! Undelivered message!')
                }
            });
        }
    });

    // LOGOUT
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/')
    })
};

// Authentication function
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
      return next();
  } else
   res.redirect('/login')
}