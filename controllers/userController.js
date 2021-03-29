const User = require('../models/user');
const UserService = require('../services/userService');

const UserController = {
    create: (req, res, next) => {

        let newUser = new User({
            login: req.body.login,
            name: req.body.name,
            hash: req.body.password,
            admin: req.body.admin
        });

        UserService.create(newUser, function (err, result) {
            if (err) {
                console.log('Error saving user ' + req.body);
                return next(err);
            }
            res.json(result);
        });

    },

    read: (req, res, next) => {
        UserService.read({}, (err, users) => {
            if (err)
                return next(err);
            res.json(users);
        });
    },

    update: (req, res, next) => {
        let user = new User({
            _id: req.params.id,
            login: req.body.login,
            name: req.body.name,
            admin: req.body.admin
        });
        if (req.body.hash)
            user.hash = req.body.hash;
        UserService.update(user, (err) => {
            if (err)
                return next(err);
            res.status(200).end();
        });
    },

    delete: (req, res, next) => {
        let user = new User({_id: req.params.id});
        UserService.delete(user, (err) => {
            if (err)
                return next(err);
            res.status(200).end();
        });
    }
}


module.exports = UserController;