import {NativeError, Types} from 'mongoose';
import IEntry from "../models/IEntry";
import Entry from "../models/entry";

class EntryService  {
    static create(entry: IEntry, callback: (err: NativeError, entry: IEntry) => void): void {
        let entryModel = new Entry(entry);
        entryModel.save(callback);
    }

    static read(entryFilter: IEntry, callback: (err: NativeError, trans: IEntry[]) => void):void {
        Entry.find(entryFilter).populate('transaction account').exec(callback);
    }

    static readDetailed(entryFilter: IEntry, callback: (err: NativeError, trans: IEntry[]) => void):void {
        let accountId = entryFilter.account._id ? entryFilter.account._id : entryFilter.account;
        Entry.aggregate([
            {   // stage 1 : get entries of the desired account
                "$match": {
                    "account": Types.ObjectId(accountId)
                }
            },
            {
                // stage 2 : join transactions
                "$lookup": {
                    "from": "transactions",
                    "as": "transaction",
                    "let": {
                        txnId: "$transaction"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {
                                            // first condition : the join condition
                                            "$eq": ["$$txnId", "$_id"]
                                        },
                                        { // second condition : only Standard transactions
                                            "$eq": ["$type", "S"]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
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
        ]).sort({date: 1})
            .exec((err, result) => {
                if (result) {
                    // calculate balance
                    // naive implementation, we get all the entries every time at once
                    let balance: number = 0;
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
    }

    static update(entry: IEntry, callback: (err: NativeError, entry: IEntry) => void):void {
        // secure debit/credit updates, so only one could be defined
        if (entry.credit && entry.credit != 0)
            entry.debit = 0;
        if (entry.debit && entry.debit != 0)
            entry.credit = 0;
        let entryModel = new Entry(entry);
        Entry.updateOne({_id: entry._id}, entryModel, {}, callback);
    }

    static batchUpdate(filter: IEntry, set: IEntry, callback: (err: NativeError) => void): void {
        Entry.updateMany(filter, set,{},callback);
    }

    static delete(entry: IEntry, callback: (err: NativeError) => void):void {
        Entry.deleteOne({_id: entry._id}, {}, callback);
    }
}

export default EntryService;