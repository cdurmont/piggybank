import mongoose from 'mongoose';
import ITransaction from "./ITransaction";
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    balanced: {type: Boolean, default: false},
    type: {type: String, enum: ['S','R','I'], default: 'S', required: true},  // Simple, Recurring, Import
    description: {type: String},
    recurStartDate: {type: Date},
    recurEndDate: {type: Date},
    recurNextDate: {type: Date}
});

export default mongoose.model<ITransaction & mongoose.Document>('Transaction', TransactionSchema);