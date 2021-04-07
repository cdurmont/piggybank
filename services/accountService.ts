import Account from '../models/account';
import IAccount from "../models/IAccount";
import {NativeError} from "mongoose";

const AccountService = {

    create: function (account: IAccount, callback: (err:NativeError, account: IAccount) => void) {
        let accountModel = new Account(account);
        accountModel.save(callback);
    },

    read: function (accountFilter: IAccount, callback: (err:NativeError, accountList: IAccount[]) => void) {
        // add support for querying accounts with no parent : use parent: {} as filter
        if (accountFilter && accountFilter.parent && Object.keys(accountFilter.parent).length === 0)    // checking an empty object is fun in js ;)
            accountFilter.parent = null;
        Account.find(accountFilter)
            .exec(callback);
    },

    update: function (account: IAccount, callback: (err:NativeError, account: IAccount) => void) {
        let accountUpdate = new Account({
            _id: account._id,
            name: account.name,
            externalRef: account.externalRef,
            iban: account.iban,
            parent: account.parent
        });

        Account.updateOne({_id: account._id}, accountUpdate, {}, callback);
    },

    delete: function (account: IAccount, callback: (err:NativeError) => void) {
        // check if account has sub-accounts
        let subAccount: IAccount = {
            parent: account._id
        };
        this.read(subAccount, (err, subAccounts) => {
            if (err)
                return callback(err);
            if (subAccounts && subAccounts.length > 0)
                return callback(new NativeError('Cannot delete account with sub-accounts'));
            Account.deleteOne({_id: account._id}, {}, callback);
        });

    }
};

export default AccountService;