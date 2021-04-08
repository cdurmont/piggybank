import {Request, Response} from "express";
import validator from "../config/validator";
import IEntry from "../models/IEntry";
import EntryService from "../services/entryService";


const EntryController = {
    create: (req: Request, res: Response) => {
        if (!validator.getSchema<IEntry>('entry')(req.body))
            return res.status(400).json({error: 'Invalid Entry JSON'});

        let entry:IEntry = req.body;

        EntryService.create(entry, (err, entry) => {
            if (err) {
                console.error('Error creating transaction ' + entry);
                return res.status(400).json({error: 'Error creating entry', detail: err});
            }
            res.json(entry);
        })
    },

    read: (req: Request, res: Response) => {
        if (!validator.getSchema<IEntry>('entry')(req.body))
            return res.status(400).json({error: 'Invalid Entry JSON'});

        let entry:IEntry = req.body;

        EntryService.read(entry, (err, entries) => {
            if (err) {
                console.error('Error reading entries, filter= ' + entry);
                return res.status(400).json({error: 'Error reading entries', detail: err});
            }
            res.json(entries);
        })
    },

    update: (req: Request, res: Response) => {
        if (!validator.getSchema<IEntry>('entry')(req.body))
            return res.status(400).json({error: 'Invalid Entry JSON'});

        let entry:IEntry = req.body;

        if (!req.params.id)
            return res.status(404).json({error: 'no entry id specified'});
        entry._id = req.params.id;
        EntryService.update(entry, (err, entry) => {
            if (err) {
                console.error('Error updating entry ' + entry);
                return res.status(400).json({error: 'Error updating entry', detail: err});
            }
            res.status(200).end();
        })
    },

    delete: (req: Request, res: Response) => {
        if (!req.params.id)
            return res.status(404).json({error: 'no entry id specified'});
        let entry:IEntry = { _id: req.params.id};
        EntryService.delete(entry, err => {
            console.error('Error deleting entry ' + entry);
            return res.status(400).json({error: 'Error deleting entry', detail: err});
        })
        res.status(200).end();
    }
}

export default EntryController;