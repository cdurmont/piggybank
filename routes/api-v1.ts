import express from 'express';
const router = express.Router();
import passport from 'passport';

import UserController from '../controllers/userController';
import AccountController from '../controllers/accountController';
import TransactionController from "../controllers/transactionController";
import EntryController from "../controllers/entryController";
import PermissionController from "../controllers/permissionController";

// API version
router.get('/version', (req, res) => {
    res.send('{"version" : "v1.0"}') ;
});

// login
router.post('/login', UserController.login);

// Users CRUD
router.post('/users', passport.authenticate('localapikey', {session: false}), UserController.create);
router.get('/users', passport.authenticate('localapikey', {session: false}), UserController.read);
router.put('/users/:id', passport.authenticate('localapikey', {session: false}), UserController.update);
router.delete('/users/:id', passport.authenticate('localapikey', {session: false}), UserController.delete);

router.get('/users/:id', passport.authenticate('localapikey', {session: false}), (req, res) => {
    // TODO read user by id
    res.send('Not implemented : read user');
})

// Accounts CRUD

router.post('/accounts', passport.authenticate('localapikey', {session: false}), AccountController.create);
router.get('/accounts', passport.authenticate('localapikey', {session: false}), AccountController.read);
router.put('/accounts/:id', passport.authenticate('localapikey', {session: false}), AccountController.update);
router.delete('/accounts/:id', passport.authenticate('localapikey', {session: false}), AccountController.delete);
router.get('/accounts/:id/balance', passport.authenticate('localapikey', {session: false}), AccountController.getBalance);


// Transactions CRUD

router.post('/transactions', passport.authenticate('localapikey', {session: false}), TransactionController.create);
router.get('/transactions', passport.authenticate('localapikey', {session: false}), TransactionController.read);
router.put('/transactions/:id', passport.authenticate('localapikey', {session: false}), TransactionController.update);
router.delete('/transactions/:id', passport.authenticate('localapikey', {session: false}), TransactionController.delete);


// Entries CRUD

router.post('/entries', passport.authenticate('localapikey', {session: false}), EntryController.create);
router.get('/entries', passport.authenticate('localapikey', {session: false}), EntryController.read);
router.get('/entries/detailed', passport.authenticate('localapikey', {session: false}), EntryController.readDetailed);
router.put('/entries/:id', passport.authenticate('localapikey', {session: false}), EntryController.update);
router.delete('/entries/:id', passport.authenticate('localapikey', {session: false}), EntryController.delete);


// Permissions CRUD

router.post('/permissions', passport.authenticate('localapikey', {session: false}), PermissionController.create);
router.get('/permissions', passport.authenticate('localapikey', {session: false}), PermissionController.read);
router.put('/permissions/:id', passport.authenticate('localapikey', {session: false}), PermissionController.update);
router.delete('/permissions/:id', passport.authenticate('localapikey', {session: false}), PermissionController.delete);


export default router;