import mongoose from 'mongoose';
import IPermission from "./IPermission";
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    user:       {type: Schema.Types.ObjectId, ref: 'User', required: true},
    account:    {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    type:       {type: String, enum: ['R','W'], required: true, default: 'W'}
});

export default mongoose.model<IPermission & mongoose.Document>('Permission', PermissionSchema);