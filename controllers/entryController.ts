import {Request, Response} from "express";
import validator from "../config/validator";
import IEntry from "../models/IEntry";
import EntryService from "../services/entryService";
import {Patch} from "../models/patch";

class EntryController  {
    static create(req: Request, res: Response) {
        if (!validator.getSchema<IEntry>('entry')(req.body))
            return res.status(400).json({error: 'Invalid Entry JSON'});

        let entry:IEntry = req.body;

        // @ts-ignore
        EntryService.create(entry, req.user, (err, entry) => {
            if (err) {
                console.error('Error creating entry ' + entry);
                return res.status(400).json({error: 'Error creating entry', detail: err});
            }
            res.json(entry);
        })
    }

    static read(req: Request, res: Response) {
        let filter;
        try {
            filter = JSON.parse(<string>req.query.filter);
        }
        catch (e) {
            return res.status(400).json({error: 'filter param is not a valid Entry JSON'});
        }
        if (!validator.getSchema<IEntry>('entry')(filter))
            return res.status(400).json({error: 'Invalid Entry JSON'});

        let entry:IEntry = filter;

        EntryService.read(entry, (err, entries) => {
            if (err) {
                console.error('Error reading entries, filter= ' + JSON.stringify(entry));
                return res.status(400).json({error: 'Error reading entries', detail: err});
            }
            res.json(entries);
        })
    }

    static readDetailed(req: Request, res: Response) {
        let reconciled:boolean = true;
        if (req.query.reconciled === "false")
            reconciled = false;
        let filter={};
        try {
            filter = JSON.parse(<string>req.query.filter);
        }
        catch (e) {
            return res.status(400).json({error: 'filter param is not a valid Entry JSON'});
        }
        if (!validator.getSchema<IEntry>('entry')(filter))
            return res.status(400).json({error: 'Invalid Entry JSON'});

        let entry:IEntry = filter;

        // @ts-ignore
        EntryService.readDetailed(entry, reconciled, req.user,(err, entries) => {
            if (err) {
                console.error('Error reading entries (detailed), filter= ' + JSON.stringify(entry));
                return res.status(400).json({error: 'Error reading entries (detailed)', detail: err});
            }
            res.json(entries);
        })
    }

    static update(req: Request, res: Response) {
        if (!validator.getSchema<IEntry>('entry')(req.body))
            return res.status(400).json({error: 'Invalid Entry JSON'});

        let entry:IEntry = req.body;

        if (!req.params.id)
            return res.status(404).json({error: 'no entry id specified'});
        entry._id = req.params.id;
        // @ts-ignore
        EntryService.update(entry, req.user,(err, entry) => {
            if (err) {
                console.error('Error updating entry ' + entry);
                return res.status(400).json({error: 'Error updating entry', detail: err});
            }
            res.status(200).end();
        })
    }

    static batchUpdate(req: Request, res: Response) {
        let patch: Patch<IEntry> = req.body;
        // @ts-ignore
        EntryService.batchUpdate(patch.filter, req.user, patch.set, err => {
            if (err) {
                console.error('Error updating multiple entries : ' + JSON.stringify(patch));
                return res.status(400).json({error: 'Error updating multiple entries', detail: err});
            }
            res.status(200).end();
        });
    }

    static delete(req: Request, res: Response) {
        if (!req.params.id)
            return res.status(404).json({error: 'no entry id specified'});
        let entry:IEntry = { _id: req.params.id};
        // @ts-ignore
        EntryService.delete(entry, req.user,err => {
            if (err) {
                console.error('Error deleting entry ' + JSON.stringify(entry));
                return res.status(400).json({error: 'Error deleting entry', detail: err});
            }
            res.status(200).end();
        });
    }
}

export default EntryController;