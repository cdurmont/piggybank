const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    login:  {type: String, required: true, maxlength: 200},
    salt:   {type: String, required: true},
    hash:   {type: String, required: true},
    apikey: {type: String, maxlength: 200},
    name:   {type: String, maxlength: 200}
});

UserSchema.virtual('displayName').get(function (){
    return this.name ? this.name : this.login;
});

module.exports = mongoose.model('User', UserSchema);