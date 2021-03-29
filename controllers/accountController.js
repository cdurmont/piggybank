const Account = require('../models/account');
const AccountService = require('../services/accountService');


const AccountController = {

    create: (req, res, next) => {
        let account = new Account({
            name: req.body.name,
            ref: req.body.ref,
            iban: req.body.iban,
            system: req.body.system,
            parent: req.body.parent ? req.body.parent : null
        });

        AccountService.create(account, (err, newAccount) => {
            if (err)
                return next(err);
            res.json(newAccount);
        });
    }
};

module.exports = AccountController;