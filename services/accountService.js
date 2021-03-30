Account = require('../models/account');


const AccountService = {

    create: function (account, callback) {
        account.save(callback);
    },

    read: function (accountFilter, callback) {
        Account.find(accountFilter)
            .exec(callback);
    },

    update: function (account, callback) {
        let accountUpdate = new Account({
            _id: account._id,
            name: account.name,
            externalRef: account.externalRef,
            iban: account.iban,
            parent: account.parent
        });

        Account.updateOne({_id: account._id}, accountUpdate, {}, callback);
    }
};

module.exports = AccountService;