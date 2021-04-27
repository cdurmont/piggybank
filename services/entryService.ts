import {NativeError, Types} from 'mongoose';
import IEntry from "../models/IEntry";
import Entry from "../models/entry";

const EntryService = {
    create: function (entry: IEntry, callback: (err:NativeError, entry: IEntry) => void) {
        let entryModel = new Entry(entry);
        entryModel.save(callback);
    },

    read: function (entryFilter: IEntry, callback: (err:NativeError, trans: IEntry[]) => void) {
        Entry.find(entryFilter).populate('transaction').exec(callback);
    },

    readDetailed: function (entryFilter: IEntry, callback: (err:NativeError, trans: IEntry[]) => void) {
        let accountId = entryFilter.account._id ? entryFilter.account._id : entryFilter.account;
        Entry.aggregate([
            {   // stage 1 : get entries of the desired account
                "$match": {
                    "account": Types.ObjectId(accountId)
                }
            },
            {   // stage 2 : join transactions
                "$lookup": {
                    "from": "transactions",
                    "localField": "transaction",
                    "foreignField": "_id",
                    "as": "transaction"
                }
            },
            {   // 1 txn per entry so we remove the unneeded []
                "$unwind": "$transaction"
            },
            {   // stage 3 : get all entries from the transaction, except the one in the current account (the "main" one)
                "$lookup": {    // stage 3.1, the join by itself
                    "from": "entries",
                    "let": {
                        txnId: "$transaction._id",
                        mainEntryId: "$_id"
                    },
                    "as": "contreparties",
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {   // first condition : the join condition
                                            "$eq": [
                                                "$$txnId",
                                                "$transaction"
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        {   // step 3.2 get the associated account of every entry (not needed for the main one, we already know the account)
                            "$lookup": {
                                "from": "accounts",
                                "localField": "account",
                                "foreignField": "_id",
                                "as": "account"
                            }
                        },
                        {   // step 3.2, unwind the account
                            "$unwind": "$account"
                        }
                    ]
                }
            }
        ])  .sort({date: 1})
            .exec((err, result) => {
                if (result) {
                    // calculate balance
                    // naive implementation, we get all the entries every time at once
                    let balance:number = 0;
                    result.forEach(entry => {
                        if (entry.debit)
                            balance += entry.debit;
                        if (entry.credit)
                            balance -= entry.credit;
                        entry.balance = balance;
                    })
                }
                return callback(err, result);
            });
    },

    update: function (entry: IEntry, callback: (err:NativeError, entry: IEntry) => void) {
        let entryModel = new Entry(entry);
        Entry.updateOne({_id: entry._id}, entryModel, {}, callback);
    },

    delete: function (entry: IEntry, callback: (err:NativeError) => void) {
        Entry.deleteOne({_id: entry._id}, {}, callback);
    }
}

export default EntryService;