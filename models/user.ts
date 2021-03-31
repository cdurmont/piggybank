import * as mongoose from 'mongoose';
import IUser from "./IUser";


const UserSchema = new mongoose.Schema({
    login: {type: String, required: true, maxlength: 200},
    salt: {type: String, required: true},
    hash: {type: String, required: true},
    apikey: {type: String, maxlength: 200},
    name: {type: String, maxlength: 200},
    admin: {type: Boolean, default: false}
});

UserSchema.virtual('displayName').get(function ():string {
    return this.name ? this.name : this.login;
});

export default mongoose.model<IUser & mongoose.Document>('User', UserSchema);