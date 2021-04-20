import {NativeError} from "mongoose";
import ITransaction from "../models/ITransaction";
import Transaction from '../models/transaction';
import async from 'async';
import EntryService from "./entryService";

const TransactionService = {

    create: function (trans: ITransaction, callback: (err:NativeError, trans: ITransaction) => void) {
        // 'balanced' attribute override if transaction contains entries
        let debit:number = 0, credit:number = 0;
        if (trans.entries) {
            trans.entries.forEach(entry => {
                if (entry.debit)
                    debit += entry.debit;
                if (entry.credit)
                    credit += entry.credit;
            });
            trans.balanced = (debit === credit);
        }
        let transModel = new Transaction(trans);
        transModel.save((err, newTrans) => {
            if (err)
                return callback(err, null);

            if (!trans.entries)
                return callback(err, newTrans);
            // save nested entries
            newTrans.entries = [];
            async.each(trans.entries,(entry, callbackEach) => {
                // save entry
                entry.transaction = newTrans;
                EntryService.create(entry, (err, entry) => {
                    if (err)
                        return callbackEach(err);
                    newTrans.entries.push(entry);   // add new entry to resulting transaction
                    callbackEach();
                })
            }, err => {
                return callback(err, newTrans);     // newTrans contains the new saved transaction + entries
            });

        });
    },

    read: function (transFilter: ITransaction, callback: (err:NativeError, trans: ITransaction[]) => void) {
        Transaction.find(transFilter)
            .exec(callback);
    },

    update: function (trans: ITransaction, callback: (err:NativeError, trans: ITransaction) => void) {
        let transUpdate = new Transaction({
            _id: trans._id,
            balanced: trans.balanced,
            description: trans.description
        });
        Transaction.updateOne({_id: trans._id}, transUpdate, {}, callback);
    },

    delete: function (trans: ITransaction, callback: (err:NativeError) => void) {
        // delete transaction entries first
        EntryService.read({transaction: trans._id}, (err, entries) => {
            if (err)
                return callback(err);
            async.forEach(entries, (entry, callbackEntry) => {
                EntryService.delete(entry, callbackEntry);
            },err => {
                if (err)
                    return callback(err);
                Transaction.deleteOne({_id: trans._id}, {}, callback);
            });
        });
    }
};

export default TransactionService;