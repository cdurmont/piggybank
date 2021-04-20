import mongoose from 'mongoose';
import ITransaction from "./ITransaction";
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    balanced: {type: Boolean, default: false},
    description: {type: String}
});

export default mongoose.model<ITransaction & mongoose.Document>('Transaction', TransactionSchema);