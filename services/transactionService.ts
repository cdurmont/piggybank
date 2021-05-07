import {NativeError} from "mongoose";
import ITransaction from "../models/ITransaction";
import Transaction from '../models/transaction';
import async from 'async';
import EntryService from "./entryService";
import IEntry from "../models/IEntry";

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
            description: trans.description,
            type: trans.type,
            recurStartDate: trans.recurStartDate,
            recurEndDate: trans.recurEndDate,
            recurNextDate: trans.recurNextDate
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
    },

    genRecurringTransactions(): void {
      // generate recurring transactions if needed
        this.read({type: 'R'}, (err: NativeError, trans: ITransaction[]) => {
           if (err) {
               console.error('Unable to get recurring transactions '+ JSON.stringify(err));
               return;
           }
           trans.forEach(recurTxn => {
               // do we actually have something to do ?
               if (recurTxn.recurNextDate.getTime() <= new Date().getTime()) {  // next occurence is in the past
                   if (!recurTxn.recurEndDate || recurTxn.recurEndDate.getTime() >= recurTxn.recurNextDate.getTime()) { // no end date, or next occurrence before end date
                       // then definitely yes, we do have work to do !
                       let newTxn:ITransaction = {
                           type: 'S',
                           entries: [],
                           description: recurTxn.description
                       };
                       // now we need the entries
                       EntryService.read({transaction: recurTxn._id}, (err, recurEntries) => {
                           if (err) {
                               console.error("Unable to get recurring transaction's entries "+ JSON.stringify(err));
                               return;
                           }
                           recurEntries.forEach(recurEntry => {
                               let newEntry:IEntry = {
                                   account : { _id: recurEntry.account._id},
                                   credit: recurEntry.credit,
                                   debit: recurEntry.debit,
                                   reference: recurEntry.reference,
                                   description: recurEntry.description,
                                   date: recurTxn.recurNextDate
                               };
                               newTxn.entries.push(newEntry);
                           });
                           // then save the new transaction
                           this.create(newTxn, (err) => {
                               if (err) {
                                   console.error("Error while saving new occurrence of recurring transaction "+ JSON.stringify(err));
                                   return;
                               }
                               // finally, update recurNextDate
                               recurTxn.recurNextDate = this.addMonths(recurTxn.recurNextDate, 1);
                               this.update(recurTxn, err => {
                                   if (err) {
                                       console.error("Error while updating recurring transaction, beware of duplicates !!! "+ JSON.stringify(err));
                                       return;
                                   }
                                   console.log(`New instance on recurring transaction ${recurTxn.description} generated`);
                               });
                           });
                       });
                   }
               }
           });
        });
    },


    addMonths(date: Date|undefined, months: number): Date|undefined {
        if (date) {
            let d = date.getDate();
            date.setMonth(date.getMonth() + +months);
            if (date.getDate() != d) {
                date.setDate(0);
            }
        }
        return date;
    },
};

export default TransactionService;