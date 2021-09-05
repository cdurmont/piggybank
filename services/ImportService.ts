import fs from 'fs';
import ofx from 'ofx';
import AccountService from "./accountService";
import IAccount from "../models/IAccount";
import ITransaction from "../models/ITransaction";
import TransactionService from "./transactionService";

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

    static ofx(path: string):void {
        console.log(`Importing OFX file ${path}...`);
        fs.readFile(path, {encoding: 'utf8'},(err, data) => {
           if (err) throw err;
           let ofxData = ofx.parse(data);
           let accounts:Array<OfxAccount> = ofxData.OFX.BANKMSGSRSV1.STMTTRNRS; // ofx is SO intuitive !
            accounts.forEach(account => {
                console.log("Account ID : "+ account.TRNUID);
                // try to find the account in the db
                AccountService.read({externalRef: account.TRNUID}, (err, accountList) => {
                    if (err) throw err;
                    let entries:Array<OfxEntry> = account.STMTRS.BANKTRANLIST.STMTTRN;  // yeah right


                    if (accountList && accountList.length>0)
                        this.importEntries(accountList[0], entries);
                    else {
                        // create account first
                        let accountDb:IAccount = {
                            externalRef: account.TRNUID,
                            type: 'I',    // Imported account
                            name: 'Import OFX'
                        };
                        AccountService.create(accountDb, (err1, accountDb) => {
                            if (err) throw err;
                            this.importEntries(accountDb, entries);
                        });
                    }
                });

            });

        });
    }


    private static importEntries(account:IAccount, ofxEntries: Array<OfxEntry>) {
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
                TransactionService.create(txn, err => {
                    if (err) throw err;
                });
            });
    }
}

export default ImportService;