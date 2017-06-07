var mongoose = require ('mongoose');
var Schema = mongoose.Schema;
var URLSlugs = require('mongoose-url-slugs');

var articleSchema = new Schema({

        title:  {type: String, default: '', trim: true},
        author: {type: String, default: '', trim: true},
        created_at: {type: Date},
        updated_at: { type: Date},
        short: {type: String},
        body:   {type: String},
        category: {type: String},
        tag: {type: String}

});

articleSchema.plugin(URLSlugs('title', {field: 'myslug'}));

//create model and export to app.js
module.exports = mongoose.model('Article', articleSchema);

