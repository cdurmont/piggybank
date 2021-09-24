import express from 'express';
const router = express.Router();
import passport from 'passport';

import UserController from '../controllers/userController';
import AccountController from '../controllers/accountController';
import TransactionController from "../controllers/transactionController";
import EntryController from "../controllers/entryController";
import PermissionController from "../controllers/permissionController";
import ImportController from "../controllers/importController";
import config from "../config/config";
import AssociationController from "../controllers/associationController";

// API version
router.get('/version', (req, res) => {
    res.send('{"version" : "v1.0"}') ;
    // res.json(config);
});

// login
router.post('/login', UserController.login);

// Users CRUD
router.post('/users', passport.authenticate('headerapikey', {session: false}), UserController.create);
router.get('/users', passport.authenticate('headerapikey', {session: false}), UserController.read);
router.put('/users/:id', passport.authenticate('headerapikey', {session: false}), UserController.update);
router.delete('/users/:id', passport.authenticate('headerapikey', {session: false}), UserController.delete);

router.get('/users/:id', passport.authenticate('headerapikey', {session: false}), (req, res) => {
    // TODO read user by id
    res.send('Not implemented : read user');
})

// Accounts CRUD

router.post('/accounts', passport.authenticate('headerapikey', {session: false}), AccountController.create);
router.get('/accounts', passport.authenticate('headerapikey', {session: false}), AccountController.read);
router.put('/accounts/:id', passport.authenticate('headerapikey', {session: false}), AccountController.update);
router.delete('/accounts/:id', passport.authenticate('headerapikey', {session: false}), AccountController.delete);
router.get('/accounts/:id/balance', passport.authenticate('headerapikey', {session: false}), AccountController.getBalance);


// Transactions CRUD

router.post('/transactions', passport.authenticate('headerapikey', {session: false}), TransactionController.create);
router.get('/transactions', passport.authenticate('headerapikey', {session: false}), TransactionController.read);
router.put('/transactions/:id', passport.authenticate('headerapikey', {session: false}), TransactionController.update);
router.delete('/transactions/:id', passport.authenticate('headerapikey', {session: false}), TransactionController.delete);


// Entries CRUD

router.post('/entries', passport.authenticate('headerapikey', {session: false}), EntryController.create);
router.patch('/entries', passport.authenticate('headerapikey', {session: false}), EntryController.batchUpdate);
router.get('/entries', passport.authenticate('headerapikey', {session: false}), EntryController.read);
router.get('/entries/detailed', passport.authenticate('headerapikey', {session: false}), EntryController.readDetailed);
router.put('/entries/:id', passport.authenticate('headerapikey', {session: false}), EntryController.update);
router.delete('/entries/:id', passport.authenticate('headerapikey', {session: false}), EntryController.delete);


// Permissions CRUD

router.post('/permissions', passport.authenticate('headerapikey', {session: false}), PermissionController.create);
router.get('/permissions', passport.authenticate('headerapikey', {session: false}), PermissionController.read);
router.put('/permissions/:id', passport.authenticate('headerapikey', {session: false}), PermissionController.update);
router.delete('/permissions/:id', passport.authenticate('headerapikey', {session: false}), PermissionController.delete);

// Imports
router.post('/imports/ofx', passport.authenticate('headerapikey', {session: false}), ImportController.ofx);

// Associations CRUD

router.post('/associations', passport.authenticate('headerapikey', {session: false}), AssociationController.create);
router.get('/associations', passport.authenticate('headerapikey', {session: false}), AssociationController.read);
router.put('/associations/:id', passport.authenticate('headerapikey', {session: false}), AssociationController.update);
router.delete('/associations/:id', passport.authenticate('headerapikey', {session: false}), AssociationController.delete);


export default router;