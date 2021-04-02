import Transaction from "../models/transaction";
import ITransaction from "../models/ITransaction";
import TransactionService from "../services/transactionService";
import {Request, Response} from "express";

const TransactionController = {
    create: (req: Request, res: Response) => {
        let trans:ITransaction = {
            balanced: req.body.balanced
        };
    },

    read: (req: Request, res: Response) => {

    },

    update: (req: Request, res: Response) => {

    },

    delete: (req: Request, res: Response) => {

    }
};

export default TransactionController;