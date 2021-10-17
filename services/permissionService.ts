import {NativeError} from "mongoose";
import IPermission from "../models/IPermission";
import Permission from "../models/permission";
import IUser from "../models/IUser";


const PermissionService = {
    create: function (perm: IPermission, user:IUser, callback: (err:NativeError, perm: IPermission) => void) {
        let permModel = new Permission(perm);
        if (!user.admin)
            return callback({name:'Permission denied', message: 'Permission management restricted to admin users'}, null);
        permModel.save(callback);
    },

    read: function (permFilter: IPermission, callback: (err:NativeError, trans: IPermission[]) => void) {
        Permission.find(permFilter)
            .populate("account")
            .exec(callback);
    },

    update: function (perm: IPermission, user:IUser, callback: (err:NativeError, perm: IPermission) => void) {
        let permModel = new Permission(perm);
        if (!user.admin)
            return callback({name:'Permission denied', message: 'Permission management restricted to admin users'}, null);
        Permission.updateOne({_id: perm._id}, permModel, {}, callback);
    },

    delete: function (perm: IPermission, user:IUser, callback: (err:NativeError) => void) {
        if (!user.admin)
            return callback({name:'Permission denied', message: 'Permission management restricted to admin users'});
        Permission.deleteOne({_id: perm._id}, {}, callback);
    }
};

export default PermissionService;