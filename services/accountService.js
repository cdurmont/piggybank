Account = require('../models/account');


const AccountService = {

    create: function (account, callback) {
        account.save(callback);
    },

    read: function (accountFilter, callback) {
        Account.find(accountFilter)
            .exec(callback);
    }
};

module.exports = AccountService;