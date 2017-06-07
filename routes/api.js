var fs = require ('fs');
var moment = require('moment');
module.exports = function (app, passport) {

    // log authorized api with access_token
    app.use(function (req, res, next) {

        var today = moment().get('hour') + ":" + moment().get('minute') +":" + moment().get('second')
            + ", " + moment().get('date') + "-" + moment().get('month') + "-" +moment().get('year');
        var fsQuery = req.path + " token: " + req.query.access_token + ", at " + today + "\n";

       fs.appendFile('logs/api-logs.txt', fsQuery , function (err) {
           next()
       })
    });

    // api router
    app.get('/testapi', passport.authenticate('bearer', { session: false }), function (req, res) {
        res.json({ SuperSecretData: "This is super secret data!" });
    })
    
};