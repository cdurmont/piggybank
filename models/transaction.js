const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    balanced: {type: Boolean, default: false}
});

module.exports = mongoose.model('Transaction', TransactionSchema);