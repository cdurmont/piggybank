import Account from '../models/account';
import AccountService from '../services/accountService';
import {Request, Response} from 'express';
import IAccount from "../models/IAccount";

const AccountController = {

    create: (req: Request, res: Response) => {
        let account:IAccount = {
            name: req.body.name,
            externalRef: req.body.externalRef,
            iban: req.body.iban,
            type: req.body.type,
            parent: req.body.parent === 'null' ? null : req.body.parent
        };

        AccountService.create(account, (err, newAccount) => {
            if (err) {
                console.error('Error creating account ' + account);
                return res.status(400).json({error: 'Error creating account', detail: err});
            }
            res.json(newAccount);
        });
    },

    read: (req: Request, res: Response) => {
        let account:IAccount = AccountController.initAccount(req);
        if (req.body.id) account._id = req.body.id;

        AccountService.read(account, (err, accounts) => {
            if (err) {
                console.error('Error reading accounts, filter: ' + account);
                return res.status(400).json({error: 'Error reading account', detail: err});
            }
            res.json(accounts);
        });
    },

    update: (req: Request, res: Response) => {
        let account:IAccount = AccountController.initAccount(req);
        if (req.params.id)
            account._id = req.params.id;
        else
            return res.status(404).json({error: 'no account id specified'});

        AccountService.update(account, (err, account) => {
            if (err) {
                console.error('Error updating account ' + account);
                return res.status(400).json({error: 'Error updating account', detail: err});
            }
            res.status(200).end();
        });
    },

    delete: (req: Request, res: Response) => {
        if (!req.params.id)
            return res.status(404).json({error: 'no account id specified'});
        let account: IAccount = new Account({_id: req.params.id});
        AccountService.delete(account, (err) => {
            if (err)
            {
                console.error('Error deleting account '+ account);
                return res.status(400).json({error: 'Error deleting account', detail: err});
            }
            res.status(200).end();
        });
    },

    initAccount: (req: Request): IAccount => {
        let account:IAccount = {};
        if (req.body.name) account.name = req.body.name;
        if (req.body.iban) account.iban = req.body.iban;
        if (req.body.externalRef) account.externalRef = req.body.externalRef;
        if (req.body.type) account.type = req.body.type;
        if (req.body.parent) account.parent = req.body.parent === 'null' ? null : req.body.parent
        return account;
    }
};

export default AccountController;