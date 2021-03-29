const Account = require('../models/account');
const AccountService = require('../services/accountService');


const AccountController = {

    create: (req, res, next) => {
        let account = new Account({
            name: req.body.name,
            ref: req.body.ref,
            iban: req.body.iban,
            type: req.body.type,
            parent: req.body.parent ? req.body.parent : null
        });

        AccountService.create(account, (err, newAccount) => {
            if (err)
                return next(err);
            res.json(newAccount);
        });
    },

    read: (req, res, next) => {
        let account = {};
        if (req.body.id) account._id = req.body.id;
        if (req.body.name) account.name = req.body.name;
        if (req.body.iban) account.iban = req.body.iban;
        if (req.body.type) account.type = req.body.type;
        if (req.body.parent) account.parent = req.body.parent;

        AccountService.read(account, (err, accounts) => {
            if (err)
                return next(err);
            res.json(accounts);
        });
    },
};

module.exports = AccountController;