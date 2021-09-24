import {Request, Response} from "express";
import validator from "../config/validator";
import IAssociation from "../models/IAssociation";
import AssociationService from "../services/associationService";


const AssociationController = {
    create: (req: Request, res: Response) => {
        if (!validator.getSchema<IAssociation>('association')(req.body))
            return res.status(400).json({error: 'Invalid Association JSON'});


        let assoc:IAssociation = req.body;
        // @ts-ignore req.user provided by passportjs
        AssociationService.create(assoc, req.user,(err, assoc) => {
            if (err) {
                console.error('Error creating association ' + JSON.stringify(assoc));
                return res.status(400).json({error: 'Error creating association', detail: err});
            }
            res.json(assoc);
        })
    },

    read: (req: Request, res: Response) => {
        let assoc;
        try {
            assoc = JSON.parse(<string>req.query.filter);
        }
        catch (e) {
            return res.status(400).json({error: 'filter param is not a valid Association JSON'});
        }

        if (!validator.getSchema<IAssociation>('association')(assoc))
            return res.status(400).json({error: 'Invalid Association JSON'});

        let assocFilter:IAssociation = assoc;
        // @ts-ignore
        AssociationService.read(assocFilter, req.user,(err, associations) => {
            if (err) {
                console.error('Error reading associations, filter= ' + JSON.stringify(assocFilter));
                return res.status(400).json({error: 'Error reading associations', detail: err});
            }
            res.json(associations);
        })
    },

    update: (req: Request, res: Response) => {
        if (!validator.getSchema<IAssociation>('association')(req.body))
            return res.status(400).json({error: 'Invalid Association JSON'});
        let assoc:IAssociation = req.body;

        if (!req.params.id)
            return res.status(404).json({error: 'no association id specified'});
        assoc._id = req.params.id;
        // @ts-ignore req.user provided by passportjs
        AssociationService.update(assoc, req.user, (err, assoc) => {
            if (err) {
                console.error('Error updating association ' + JSON.stringify(assoc));
                return res.status(400).json({error: 'Error updating association', detail: err});
            }
            res.status(200).end();
        })
    },

    delete: (req: Request, res: Response) => {
        if (!req.params.id)
            return res.status(404).json({error: 'no association id specified'});
        let assoc:IAssociation = { _id: req.params.id};
        // @ts-ignore req.user provided by passportjs
        AssociationService.delete(assoc, req.user, err => {
            if (err) {
                console.error('Error deleting association ' + JSON.stringify(assoc));
                return res.status(400).json({error: 'Error deleting association', detail: err});
            }
            res.status(200).end();
        });

    }
}

export default AssociationController;