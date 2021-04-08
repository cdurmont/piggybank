import {NativeError} from 'mongoose';
import IEntry from "../models/IEntry";
import Entry from "../models/entry";

const EntryService = {
    create: function (entry: IEntry, callback: (err:NativeError, entry: IEntry) => void) {
        let entryModel = new Entry(entry);
        entryModel.save(callback);
    },

    read: function (entryFilter: IEntry, callback: (err:NativeError, trans: IEntry[]) => void) {
        Entry.find(entryFilter)
            .exec(callback);
    },

    update: function (entry: IEntry, callback: (err:NativeError, entry: IEntry) => void) {
        let entryModel = new Entry(entry);
        Entry.updateOne({_id: entry._id}, entryModel, {}, callback);
    },

    delete: function (entry: IEntry, callback: (err:NativeError) => void) {
        Entry.deleteOne({_id: entry._id}, {}, callback);
    }
}

export default EntryService;