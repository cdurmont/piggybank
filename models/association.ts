import mongoose from 'mongoose';
import IAssociation from "./IAssociation";
const Schema = mongoose.Schema;

const AssociationSchema = new Schema({
    regex:       {type: String, maxlength: 800,required: true},
    account:     {type: Schema.Types.ObjectId, ref: 'Account', required: true}
});

export default mongoose.model<IAssociation & mongoose.Document>('Association', AssociationSchema);