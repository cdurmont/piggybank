const express = require('express');
const router = express.Router();
const passport = require('passport');

const UserController = require('../controllers/userController');
const AccountController = require('../controllers/accountController');

// API version
router.get('/version', (req, res) => {
    res.send('v1.0') ;
});

// login
router.post('/login',
            passport.authenticate('basic', {session: false}),
            (req, res) => {
                res.json(req.user);
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

module.exports = router;