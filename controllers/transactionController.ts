import ITransaction from "../models/ITransaction";
import TransactionService from "../services/transactionService";
import {Request, Response} from "express";
import validator from "../config/validator";

const TransactionController = {
    create: (req: Request, res: Response) => {
        if (!validator.getSchema<ITransaction>('transaction')(req.body))
            return res.status(400).json({error: 'Invalid Transaction JSON'});
        let trans:ITransaction = req.body;
        // @ts-ignore
        TransactionService.create(trans, req.user, (err, trans) => {
            if (err) {
                console.error('Error creating transaction ' + trans);
                return res.status(400).json({error: 'Error creating transaction', detail: err});
            }
            res.json(trans);
        })
    },

    read: (req: Request, res: Response) => {
        let filter;
        try {
            filter = JSON.parse(<string>req.query.filter);
        }
        catch (e) {
            return res.status(400).json({error: 'filter param is not a valid Transaction JSON'});
        }
        if (!validator.getSchema<ITransaction>('transaction')(filter))
            return res.status(400).json({error: 'Invalid Transaction JSON'});
        let trans:ITransaction = filter;

        TransactionService.read(trans, (err, transList) => {
            if (err) {
                console.error('Error reading transactions, filter= ' + trans);
                return res.status(400).json({error: 'Error reading transaction', detail: err});
            }
            res.json(transList);
        })
    },

    update: (req: Request, res: Response) => {
        if (!validator.getSchema<ITransaction>('transaction')(req.body))
            return res.status(400).json({error: 'Invalid Transaction JSON'});
        let trans:ITransaction = req.body;
        if (!req.params.id)
            return res.status(404).json({error: 'no transaction id specified'});
        trans._id = req.params.id;

        TransactionService.update(trans, (err, trans) => {
            if (err) {
                console.error('Error updating transaction ' + trans);
                return res.status(400).json({error: 'Error updating transaction', detail: err});
            }
            res.json(trans);
        })
    },

    delete: (req: Request, res: Response) => {
        if (!req.params.id)
            return res.status(404).json({error: 'no transaction id specified'});
        let trans:ITransaction = { _id: req.params.id};
        // @ts-ignore
        TransactionService.delete(trans, req.user, err => {
            if (err) {
                console.error('Error deleting transaction ' + trans);
                return res.status(400).json({error: 'Error deleting transaction', detail: err});
            }
            res.status(200).end();
        })
    }
};

export default TransactionController;