import {Request, Response} from "express";
import validator from "../config/validator";
import IPermission from "../models/IPermission";
import PermissionService from "../services/permissionService";


const PermissionController = {
    create: (req: Request, res: Response) => {
        if (!validator.getSchema<IPermission>('permission')(req.body))
            return res.status(400).json({error: 'Invalid Permission JSON'});

        let perm:IPermission = req.body;

        PermissionService.create(perm, (err, perm) => {
            if (err) {
                console.error('Error creating permission ' + perm);
                return res.status(400).json({error: 'Error creating permission', detail: err});
            }
            res.json(perm);
        })
    },

    read: (req: Request, res: Response) => {
        if (!validator.getSchema<IPermission>('permission')(req.body))
            return res.status(400).json({error: 'Invalid Permission JSON'});

        let permFilter:IPermission = req.body;

        PermissionService.read(permFilter, (err, permissions) => {
            if (err) {
                console.error('Error reading permissions, filter= ' + permFilter);
                return res.status(400).json({error: 'Error reading permissions', detail: err});
            }
            res.json(permissions);
        })
    },

    update: (req: Request, res: Response) => {
        if (!validator.getSchema<IPermission>('permission')(req.body))
            return res.status(400).json({error: 'Invalid Permission JSON'});

        let perm:IPermission = req.body;

        if (!req.params.id)
            return res.status(404).json({error: 'no permission id specified'});
        perm._id = req.params.id;
        PermissionService.update(perm, (err, perm) => {
            if (err) {
                console.error('Error updating permission ' + perm);
                return res.status(400).json({error: 'Error updating permission', detail: err});
            }
            res.status(200).end();
        })
    },

    delete: (req: Request, res: Response) => {
        if (!req.params.id)
            return res.status(404).json({error: 'no permission id specified'});
        let perm:IPermission = { _id: req.params.id};
        PermissionService.delete(perm, err => {
            if (err) {
                console.error('Error deleting permission ' + perm);
                return res.status(400).json({error: 'Error deleting permission', detail: err});
            }
            res.status(200).end();
        });

    }
}

export default PermissionController;