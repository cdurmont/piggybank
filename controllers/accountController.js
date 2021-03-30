const Account = require('../models/account');
const AccountService = require('../services/accountService');


const AccountController = {

    create: (req, res, next) => {
        let account = new Account({
            name: req.body.name,
            externalRef: req.body.externalRef,
            iban: req.body.iban,
            type: req.body.type,
            parent: req.body.parent
        });

        AccountService.create(account, (err, newAccount) => {
            if (err)
                return next(err);
            res.json(newAccount);
        });
    },

    read: (req, res, next) => {
        let account = AccountController.initAccount(req);
        if (req.body.id) account._id = req.body.id;

        AccountService.read(account, (err, accounts) => {
            if (err)
                return next(err);
            res.json(accounts);
        });
    },

    update: (req, res, next) => {
        let account = AccountController.initAccount(req);
        if (req.params.id)
            account._id = req.params.id;
        else
            return next({error: 'no account id specified'});

        AccountService.update(account, (err, account) => {
            if (err)
                return next(err);
            res.status(200).end();
        });
    },

    initAccount: (req) => {
        let account = {};
        if (req.body.name) account.name = req.body.name;
        if (req.body.iban) account.iban = req.body.iban;
        if (req.body.externalRef) account.externalRef = req.body.externalRef;
        if (req.body.type) account.type = req.body.type;
        if (req.body.parent) account.parent = req.body.parent;
        return account;
    }
};

module.exports = AccountController;