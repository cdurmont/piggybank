const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');

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
router.post('/users', passport.authenticate('localapikey', {session: false}), userController.create);
router.get('/users', passport.authenticate('localapikey', {session: false}), userController.read);
router.put('/users/:id', passport.authenticate('localapikey', {session: false}), userController.update);
router.delete('/users/:id', passport.authenticate('localapikey', {session: false}), userController.delete);

router.get('/users/:id', passport.authenticate('localapikey', {session: false}), (req, res) => {
    // TODO read user by id
    res.send('Not implemented : read user');
})




module.exports = router;