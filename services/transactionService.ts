import {NativeError} from "mongoose";
import ITransaction from "../models/ITransaction";
import Transaction from '../models/transaction';

const TransactionService = {

    create: function (trans: ITransaction, callback: (err:NativeError, trans: ITransaction) => void) {
        let transModel = new Transaction(trans);
        transModel.save(callback);
    },

    read: function (transFilter: ITransaction, callback: (err:NativeError, trans: ITransaction[]) => void) {
        Transaction.find(transFilter)
            .exec(callback);
    },

    update: function (trans: ITransaction, callback: (err:NativeError, trans: ITransaction) => void) {
        let transUpdate = new Transaction({
            _id: trans._id,
            balanced: trans.balanced
        });
        Transaction.updateOne({_id: trans._id}, transUpdate, {}, callback);
    },

    delete: function (trans: ITransaction, callback: (err:NativeError) => void) {
        // TODO delete transaction entries first
        Transaction.deleteOne({_id: trans._id}, {}, callback);
    }
};

export default TransactionService;