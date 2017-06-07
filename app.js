
// ---------------------- REQUIRE MODULES ----------------------
var express = require ('express');
var app = express();
var port = process.env.PORT || 3001;

var exphbs = require ('express-handlebars');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require ('morgan');
var bodyParser = require('body-parser');
var passport = require ('passport');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);

var mongoose = require('mongoose');

var configDB = require('./config/database');

// DB connection
mongoose.connect(configDB.url);

// Require passport config
require('./config/passport')(passport);

// ---------------------- EXPRESS SETTINGS ----------------------

// ******** Cookie, Body-parser, Session, Session Store and Logger ***********
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
      secret: 'jhjklwerjkewkewewrblqqqk',
      saveUninitialized: true,
      resave: true,
      store: new MongoStore({
          mongooseConnection: mongoose.connection, // store session in db
          ttl: 2 * 24 * 60 * 60                   //  session expired in 2 days
      })
}));
app.use(passport.initialize()); // initialize passport
app.use(passport.session());    // passport session must be after express-session

// ********** Express-validator middleware and flash messages ***
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));
app.use(flash());

// Global variables for flash messages
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg'); // assign local variable to 'res.locals' and make it global
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; // if user is logged will see 'logout' and 'dashboard',
                                        // if not - 'login' and 'register' pages,
                                        // This global is accessed in handlebars under the 'user'
    next();
});


// ******** View Engine ********************
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// ******** public folder for static files ********************
app.use(express.static('public'));

// ----------------------- CONTENT ------------------------------

require('./routes/users')(app, passport);
require('./routes/api')(app, passport);
require('./routes/articles')(app);

// ----------------------- LISTENING ----------------------------
app.listen(port, function () {
   console.log('Server Up and Running at port: ' + port)
});