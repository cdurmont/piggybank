import IUser from "../models/IUser";
import {NativeError} from "mongoose";
import IAssociation from "../models/IAssociation";
import Association from "../models/association";



class AssociationService  {


    public static create(assoc: IAssociation, user:IUser, callback: (err:NativeError, assoc: IAssociation) => void) {
        let assocModel = new Association(assoc);
        if (!user.admin)
            return callback({name:'Permission denied', message: 'Association management restricted to admin users'}, null);
        assocModel.save(callback);
    }

    public static read(assocFilter: IAssociation, user:IUser, callback: (err:NativeError, assoc: IAssociation[]) => void) {
        if (!user.admin)
            return callback({name:'Permission denied', message: 'Association management restricted to admin users'}, null);
        Association.find(assocFilter)
            .populate('account')
            .exec(callback);
    }

    public static update(assoc: IAssociation, user:IUser, callback: (err:NativeError, assoc: IAssociation) => void) {
        let assocModel = new Association(assoc);
        if (!user.admin)
            return callback({name:'Permission denied', message: 'Association management restricted to admin users'}, null);
        Association.updateOne({_id: assoc._id}, assocModel, {}, callback);
    }

    public static delete(assoc: IAssociation, user:IUser, callback: (err:NativeError) => void) {
        if (!user.admin)
            return callback({name:'Permission denied', message: 'Association management restricted to admin users'});
        Association.deleteOne({_id: assoc._id}, {}, callback);
    }
}

export default AssociationService;