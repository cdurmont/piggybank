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
    },

    delete: function (account, callback) {
        // check if account has sub-accounts
        let subAccount = {
            parent: account._id
        };
        this.read(subAccount, (err, subAccounts) => {
            if (err)
                return callback(err);
            if (subAccounts && subAccounts.length > 0)
                return callback({error: 'Cannot delete account with sub-accounts'});
            Account.deleteOne({_id: account._id}, {}, callback);
        });

    }
};

module.exports = AccountService;