import express from 'express';
const router = express.Router();
import passport from 'passport';

import UserController from '../controllers/userController';
import AccountController from '../controllers/accountController';
import TransactionController from "../controllers/transactionController";

// API version
router.get('/version', (req, res) => {
    res.send('v1.0') ;
});

// login
router.post('/login',
            passport.authenticate('basic', {session: false}),
            (req, res) => {
                res.json(req['user']);
            });

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


// Transactions CRUD

router.post('/transactions', passport.authenticate('localapikey', {session: false}), TransactionController.create);
router.get('/transactions', passport.authenticate('localapikey', {session: false}), TransactionController.read);
router.put('/transactions/:id', passport.authenticate('localapikey', {session: false}), TransactionController.update);
router.delete('/transactions/:id', passport.authenticate('localapikey', {session: false}), TransactionController.delete);


export default router;