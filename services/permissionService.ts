import {NativeError} from "mongoose";
import IPermission from "../models/IPermission";
import Permission from "../models/permission";


const PermissionService = {
    create: function (perm: IPermission, callback: (err:NativeError, perm: IPermission) => void) {
        let permModel = new Permission(perm);
        permModel.save(callback);
    },

    read: function (permFilter: IPermission, callback: (err:NativeError, trans: IPermission[]) => void) {
        Permission.find(permFilter)
            .exec(callback);
    },

    update: function (perm: IPermission, callback: (err:NativeError, perm: IPermission) => void) {
        let permModel = new Permission(perm);
        Permission.updateOne({_id: perm._id}, permModel, {}, callback);
    },

    delete: function (perm: IPermission, callback: (err:NativeError) => void) {
        Permission.deleteOne({_id: perm._id}, {}, callback);
    }
};

export default PermissionService;