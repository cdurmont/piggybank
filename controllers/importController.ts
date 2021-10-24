import {Request, Response} from "express";
import {UploadedFile} from "express-fileupload";
import os from 'os';
import path from "path";
import ImportService from "../services/ImportService";

const ImportController = {
    ofx: (req: Request, res: Response) => {
        try {
            if(!req.files || !req.files.ofx)
                return res.send({ status: false, message: 'No file uploaded' });
            let ofx:UploadedFile;
            if (Array.isArray(req.files.ofx) )
                ofx = req.files.ofx[0];
            else
                ofx = req.files.ofx;
            let ofxPath = path.join(os.tmpdir(), ofx.name);
            ofx.mv(ofxPath).then(() => {
                // @ts-ignore
                ImportService.ofx(ofxPath, req.user);
                res.status(200).end();
            });
        } catch (err) {
            console.error("error importing file :"+ JSON.stringify(err));
            res.status(500).end(JSON.stringify(err));
        }

    },


};

export default ImportController;