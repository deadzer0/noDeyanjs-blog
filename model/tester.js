var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var personSchema = Schema({
    _id     : Number,
    name    : String,
    age     : Number,
    stories : [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var storySchema = Schema({
    _creator : { type: Number, ref: 'Person' },
    title    : String
});

var Story  = mongoose.model('Story', storySchema);
var Person = mongoose.model('Person', personSchema);

//
var aaron = new Person({
    _id: 1,
    name: 'Aaron',
    age: 55
});

aaron.save(function (err) {
    if (err)
        console.log('error!');

    var story1 = new Story({
        title: "Once upon a time",
        _creator: aaron._id    // assign the _id from the person
    });

    story1.save(function (err) {
        if (err)
            console.log('error!');
    });

    var story2 = new Story({
        title: "Story 2",
        _creator: aaron._id    // assign the _id from the person
    });

    story2.save(function (err) {
        if (err)
            console.log('error!');
    });

});

Story
    .findOne({ title: 'Story 2' })
    .populate('_creator')
    .exec(function (err, story) {
        if (err)
            console.log('error!');
        console.log('The creator of ' + story.title + ' is: ' +  story._creator.name);
        // prints "The creator is Aaron"
    });

// harcoding the comments
var comments = [
    {
        name: "ivan_22",
        picture: 'http://www.uni-regensburg.de/Fakultaeten/phil_Fak_II/Psychologie/Psy_II/beautycheck/english/durchschnittsgesichter/m(01-32)_gr.jpg',
        says: "Az sym Ivan 22"
    },{
        name: "Gosho@bv.bg",
        picture: "https://creators-images.vice.com/content-images/contentimage/no-slug/d4d24f28d34addbcb66fb9e86c8276b2.jpg",
        says: "Az sym Gosho ot pochivka"
    },{
        name: "Kiro Skalata",
        picture: "http://i2.mirror.co.uk/incoming/article5423743.ece/ALTERNATES/s615b/MOST-BEAUTIFUL-FACES.jpg",
        says: "Az sym KIro skalata"
    }
];

//

Article.findOne({_id: 2}, function(err, article){
    if (err){
        res.send('No article with this title' + '\n' + err.message)
    }else{

        var newComment = new Comments({

            _article : article._id,
            name    : req.body.name,
            comment : req.body.comment
            // assign the _id from the person
        });

        newComment.save(function (err) {
            if (err)
                console.log('error!');
        });

        console.log(article)

    }



});

// OLD HOME
Article.find({}, function(err, articles) {
    if (err) throw err;
    res.render('home', {'articles': articles})
}).sort({created: -1}).limit(20);             // this method limits articles to '20'

// Sync way
// Article.find({}).sort({created_at: -1}).exec( function (err, result) {
//         Article.count({}).exec(function (err, result2) {
//             res.render('home', {
//                 'result': result,
//                 'result2': result2
//             })
//         })
//         }
//     );
comments : [{ type: Schema.Types.ObjectId, ref: 'Comments' }]
// END Async way

// Article.findOne({myslug: myslug}, function(err, article){
//     if (err){
//         res.send('No article with this title' + '\n' + err.message)
//     }else{
//         res.render('show-article', {
//             'article': article
//         })
//     }
// });