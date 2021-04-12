import User from '../models/user';
import UserService from '../services/userService';
import IUser from "../models/IUser";
import {Request, Response} from 'express';
import validator from "../config/validator";

const UserController = {
    create: (req: Request, res: Response) => {

        if (!validator.getSchema<IUser>('user')(req.body))
            return res.status(400).json({error: 'Invalid User JSON'});
        let newUser:IUser = req.body;

        UserService.create(newUser, function (err, result) {
            if (err) {
                console.error('Error saving user ' + newUser);
                return res.status(400).json({error: 'Error creating user', detail: err});
            }
            res.json(result);
        });

    },

    read: (req: Request, res: Response) => {
        UserService.read({}, (err, users) => {
            if (err) {
                console.error('Error reading user list');
                return res.status(400).json({error: 'Error reading user', detail: err});
            }
            res.json(users);
        });
    },

    update: (req: Request, res: Response) => {
        if (!validator.getSchema<IUser>('user')(req.body))
            return res.status(400).json({error: 'Invalid User JSON'});
        let user:IUser = req.body;
        user._id = req.params.id;

        UserService.update(user, (err) => {
            if (err) {
                console.error('Error updating user ' + user);
                return res.status(400).json({error: 'Error updating user', detail: err});
            }
            res.status(200).end();
        });
    },

    delete: (req: Request, res: Response) => {

        let user = new User({_id: req.params.id});
        UserService.delete(user, (err) => {
            if (err) {
                console.error('Error deleting user');
                return res.status(400).json({error: 'Error deleting user', detail: err});
            }
            res.status(200).end();
        });
    },

    login: (req: Request, res: Response) => {
        if (!validator.getSchema<IUser>('user')(req.body))
            return res.status(400).json({error: 'Invalid User JSON'});
        let user:IUser = req.body;
        UserService.login(user, function (err, result) {
            if (err) {
                console.error('Error logging in user ' + user);
                return res.status(400).json({error: 'Error logging in user', detail: err});
            }
            if (!result)
                return res.status(403).json({error: 'Invalid user/password'});
            res.json(result);
        });
    }
}


export default UserController;