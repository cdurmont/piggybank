const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    user:       {type: Schema.Types.ObjectId, ref: 'User', required: true},
    account:    {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    type:       {type: String, enum: ['R','W'], required: true, default: 'W'}
});

module.exports = mongoose.model('Permission', PermissionSchema);