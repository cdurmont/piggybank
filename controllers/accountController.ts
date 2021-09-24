import Account from '../models/account';
import AccountService from '../services/accountService';
import {Request, Response} from 'express';
import IAccount from "../models/IAccount";
import validator from "../config/validator";
import IUser from "../models/IUser";

const AccountController = {

    create: (req: Request, res: Response) => {

        if (!validator.getSchema<IAccount>('account')(req.body))
            return res.status(400).json({error: 'Invalid Account JSON'});
        let account:IAccount = req.body;

        // @ts-ignore req.user provided by passportjs
        AccountService.create(account, req.user, (err, newAccount) => {
            if (err) {
                console.error('Error creating account ' + JSON.stringify(account));
                return res.status(400).json({error: 'Error creating account', detail: err});
            }
            res.json(newAccount);
        });
    },

    read: (req: Request, res: Response) => {
        let acc;
        try {
            acc = JSON.parse(<string>req.query.filter);
        }
        catch (e) {
            return res.status(400).json({error: 'filter param is not a valid Account JSON'});
        }

        if (!validator.getSchema<IAccount>('account')(acc))
            return res.status(400).json({error: 'Invalid Account JSON'});
        let account:IAccount = acc;

        // @ts-ignore req.user added by passportjs
        AccountService.read(account, req.user, (err, accounts) => {
            if (err) {
                console.error('Error reading accounts, filter: ' + JSON.stringify(account));
                return res.status(400).json({error: 'Error reading account', detail: err});
            }
            res.json(accounts);
        });
    },

    update: (req: Request, res: Response) => {
        // if (!validator.getSchema<IAccount>('account')(req.body))
        //     return res.status(400).json({error: 'Invalid Account JSON'});
        let account:IAccount = req.body;

        if (req.params.id)
            account._id = req.params.id;
        else
            return res.status(404).json({error: 'no account id specified'});

        // @ts-ignore req.user provided by passportjs
        AccountService.update(account, req.user, (err, account) => {
            if (err) {
                console.error('Error updating account ' + JSON.stringify(account));
                return res.status(400).json({error: 'Error updating account', detail: err});
            }
            res.status(200).end();
        });
    },

    delete: (req: Request, res: Response) => {
        if (!req.params.id)
            return res.status(404).json({error: 'no account id specified'});
        let account: IAccount = new Account({_id: req.params.id});
        // @ts-ignore
        AccountService.delete(account, req.user,(err) => {
            if (err)
            {
                console.error('Error deleting account '+ account._id);
                return res.status(400).json({error: 'Error deleting account', detail: err});
            }
            res.status(200).end();
        });
    },

    getBalance: (req: Request, res: Response) => {
        if (!req.params.id)
            return res.status(404).json({error: 'no account id specified'});
        let account: IAccount = new Account({_id: req.params.id});
        // @ts-ignore
        AccountService.getBalance(account, req.user, (err, balance) => {
            if (err) {
                console.error('Error getting balance of account ' + account._id);
                return res.status(400).json({error: 'Error getting balance of account', detail: err});
            }
            res.json({balance: balance});
        })
    }
};

export default AccountController;