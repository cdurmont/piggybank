const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    name: {type: String, maxlength: 200, required: true},
    externalRef: {type: String, maxlength: 100, required: false},
    iban: {type: String, maxlength: 34, required: false},
    parent: {type: Schema.Types.ObjectId, ref: 'Account', required: false},
    type: {type: String, required: true, enum: ['S', 'U']}    // type = System ou User-defined
});

module.exports = mongoose.model('Account', AccountSchema);