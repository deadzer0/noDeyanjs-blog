// require Models
var Article =   require('../model/articles');

// async
var async = require('async');

module.exports = function (app) {


//*********************************** Article routes *************************************
// CREATE
app.get('/article/new', isLoggedIn, function (req, res) {
    res.render('create')
});

app.post('/article/new', function (req, res) {

    var short = req.body.body;
    var shortBody = short.slice(0, 400);

    var newArticle = new Article({
        id:             req.body.id,
        title:          req.body.title,
        author:         req.body.author,
        created_at:     Date.now(),
        body:           req.body.body,
        short:          shortBody,
        category:       req.body.category,
        tag:            req.body.tag
    });
    newArticle.save(function (err) {
        if (err)
            throw err;
    });

    res.redirect('/')
});

// LIST all
app.get('/article', function (req, res) {

    //sync way
    Article.find({}, function (err, articles) {
        if (err){
            res.send('No article with this title' + '\n' + err.message)
        }else{
            res.render('show-all', {'articles': articles})
        }
    }).sort({created_at: -1}).limit(20);
});

// Article by slug (id)
app.get('/article/:myslug', function(req, res) {

    var myslug = req.params.myslug;

    // Async way
    async.parallel({
        articleFind: function (cb){ Article.findOne({myslug: myslug}).exec(cb); }
    }, function(err, result){
        var article = result.articleFind;

        res.render('show-article', {
            'article': article
        });
    });
});

//UPDATE
app.get('/update/:id', isLoggedIn, function (req, res) {
    var id = req.params.id;

    Article.findById(id, function (err, article) {
        if (err) throw err;

        res.render('update-article', {'article': article})
    });
});

app.post('/update/:id', function (req, res) {
    var id = req.params.id;
    var title =   req.body.title;
    var author=  req.body.author;
    var body =    req.body.body;

    Article.findByIdAndUpdate(id, {

        title: title,
        author: author,
        body: body,
        updated_at: Date.now()

    }, function(err, article) {
        if (err) throw err;

        article.save(function (err) {
            if (err)
                throw err;
        })
    });
    res.redirect('/')
});


// DELETE
app.get('/article/:id/delete', isLoggedIn, function (req, res) {
    var id = req.params.id;

    Article.findByIdAndRemove(id, function(err) {
        if (err) throw err;

        res.redirect('/');
    });
});

// Authentication function
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else
        res.redirect('/login')
}

};