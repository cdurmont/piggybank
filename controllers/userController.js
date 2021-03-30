const User = require('../models/user');
const UserService = require('../services/userService');

const UserController = {
    create: (req, res) => {

        let newUser = new User({
            login: req.body.login,
            name: req.body.name,
            hash: req.body.password,
            admin: req.body.admin
        });

        UserService.create(newUser, function (err, result) {
            if (err) {
                console.error('Error saving user ' + newUser);
                return res.status(400).json({error: 'Error creating user', detail: err});
            }
            res.json(result);
        });

    },

    read: (req, res) => {
        UserService.read({}, (err, users) => {
            if (err) {
                console.error('Error reading user list');
                return res.status(400).json({error: 'Error reading user', detail: err});
            }
            res.json(users);
        });
    },

    update: (req, res) => {
        let user = new User({
            _id: req.params.id,
            login: req.body.login,
            name: req.body.name,
            admin: req.body.admin
        });
        if (req.body.hash)
            user.hash = req.body.hash;
        UserService.update(user, (err) => {
            if (err) {
                console.error('Error updating user ' + user);
                return res.status(400).json({error: 'Error updating user', detail: err});
            }
            res.status(200).end();
        });
    },

    delete: (req, res) => {
        let user = new User({_id: req.params.id});
        UserService.delete(user, (err) => {
            if (err) {
                console.error('Error deleting user');
                return res.status(400).json({error: 'Error deleting user', detail: err});
            }
            res.status(200).end();
        });
    }
}


module.exports = UserController;