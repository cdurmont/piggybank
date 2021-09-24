import fs from 'fs';
import ofx from 'ofx';
import AccountService from "./accountService";
import IAccount from "../models/IAccount";
import ITransaction from "../models/ITransaction";
import TransactionService from "./transactionService";
import IUser from "../models/IUser";

interface OfxAccount {
    STMTRS: any;        // rest of the structure, including entries
    TRNUID: string;     // account ID
}
interface OfxEntry {
    TRNTYPE: string; // DEBIT || CREDIT
    DTPOSTED: string; // date yyyymmddhhiiss
    TRNAMT: string;     // amount (string to be parsed). <0 if TRNTYPE=DEBIT, >=0 otherwise
    FITID: string;      // unique identifier ?
    REFNUM: string;     // reference
    NAME: string;       // description
    MEMO: string;       // additional details
}

class ImportService  {

    /**
     * Import ofx file
     * @param path Path of file to import
     */
    static ofx(path: string, user):void {
        if (!user.admin) {
            console.log('Import retricted to admin users');
            return;
        }
        console.log(`Importing OFX file ${path}...`);
        fs.readFile(path, {encoding: 'utf8'},(err, data) => {
           if (err) throw err;
           let ofxData = ofx.parse(data);
           let accounts:Array<OfxAccount> = ofxData.OFX.BANKMSGSRSV1.STMTTRNRS; // ofx is SO intuitive !
            accounts.forEach(account => {
                console.log("Account ID : "+ account.TRNUID);
                // try to find the account in the db
                AccountService.read({externalRef: account.TRNUID}, user,(err, accountList) => {
                    if (err) throw err;

                    // Possible values for STMTTRN :
                    // undefined    : no entries for this account
                    // array        : you kinda expect that
                    // object       : when there is only one entry, it's not wrapped into an array (such a good design...)
                    let objEntries = account.STMTRS.BANKTRANLIST.STMTTRN;  // yeah right
                    let entries:Array<OfxEntry>;
                    if (!objEntries || Array.isArray(objEntries))   // undefined or array can be passed as-is
                        entries = objEntries;
                    else
                        entries = [objEntries];

                    if (accountList && accountList.length>0)
                        this.importEntries(accountList[0], user, entries);
                    else {
                        // create account first
                        let accountDb:IAccount = {
                            externalRef: account.TRNUID,
                            type: 'I',    // Imported account
                            name: 'Import OFX'
                        };
                        AccountService.create(accountDb, user, (err1, accountDb) => {
                            if (err) throw err;
                            this.importEntries(accountDb, user, entries);
                        });
                    }
                });

            });

        });
    }

    private static importEntries(account:IAccount, user:IUser, ofxEntries: Array<OfxEntry>) {
        if (ofxEntries)
            ofxEntries.forEach(ofxEntry => {
                console.log("\t"+ ofxEntry.NAME+"\t"+ofxEntry.TRNTYPE+"\t"+ofxEntry.TRNAMT);
                let txn:ITransaction = {
                    type: 'I',  // import
                    description: ofxEntry.NAME,
                    entries: [{
                        account: account,
                        description: ofxEntry.MEMO,
                        reference: ofxEntry.REFNUM,
                        debit: ofxEntry.TRNTYPE === 'CREDIT' ? +ofxEntry.TRNAMT : undefined,    // swapping credit/debit as the file is in the bank's point of view
                        credit: ofxEntry.TRNTYPE === 'DEBIT' ? -+ofxEntry.TRNAMT : undefined,
                        date: new Date(+ofxEntry.DTPOSTED.slice(0,4),+ofxEntry.DTPOSTED.slice(4,6)-1,+ofxEntry.DTPOSTED.slice(6,8)) // -1 for month (0-11)
                    }]
                };
                // TODO some form of account guessing to balance the transaction would be great !
                TransactionService.create(txn, user,err => {
                    if (err) throw err;
                });
            });
    }
}

export default ImportService;