import mongoose from 'mongoose';
import IEntry from "./IEntry";
const Schema = mongoose.Schema;

const EntrySchema = new Schema({
    date:           {type: Date, required: true, default: Date.now},
    account :       {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    transaction:    {type: Schema.Types.ObjectId, ref: 'Transaction', required: true},
    credit:         {type: Number},
    debit:          {type: Number},
    reference:      {type: String, maxlength: 100},
    description:    {type: String, maxlength: 200}
});

export default mongoose.model<IEntry & mongoose.Document>('Entry', EntrySchema);