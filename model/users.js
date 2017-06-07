var mongoose = require ('mongoose');
var bcrypt = require ('bcrypt');

var Schema = mongoose.Schema;

var userSchema = new Schema({

    local: {
        username: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

                        //bcrypt
// Add salt
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9))
};
// compare passwords
userSchema.methods.comparePassword =  function (password) {
    return bcrypt.compareSync(password, this.local.password)
};

//create model and export to app.js
module.exports = mongoose.model('User', userSchema);
