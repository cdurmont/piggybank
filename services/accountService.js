

const AccountService = {

    create: function (account, callback) {
        account.save(callback);
    },
    
    read: function (accountFilter, callback) {

    }
};

module.exports = AccountService;