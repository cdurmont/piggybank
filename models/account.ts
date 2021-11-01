import * as mongoose from 'mongoose';
import IAccount from "./IAccount";
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    name: {type: String, maxlength: 200, required: true},
    externalRef: {type: String, maxlength: 100, required: false},
    iban: {type: String, maxlength: 34, required: false},
    parent: {type: Schema.Types.ObjectId, ref: 'Account', required: false},
    type: {type: String, required: true, enum: ['S', 'U', 'I']},    // type = System ou User-defined, 'I' = imported account
    colorRevert: {type: Boolean, default: false}
});

export default mongoose.model<IAccount & mongoose.Document>('Account', AccountSchema);