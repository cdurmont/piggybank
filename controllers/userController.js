const User = require('../models/user');
const UserService = require('../services/userService');


exports.create = (req, res, next) => {

    let newUser = new User({
        login: req.body.login,
        name: req.body.name,
        hash: req.body.password
    });

    UserService.create(newUser, function (err, result) {
        if (err) {
            console.log('Error saving user ' + req.body);
            return next(err);
        }
        res.json(result);
    });

}


exports.read = [

    (req, res, next) => {
        UserService.read({},(err, users) => {
            if (err)
                return next(err);
            res.json(users);
        });
    }
]

exports.update = [
    (req, res, next) => {
        let user = new User({
            _id: req.params.id,
            login: req.body.login,
            name: req.body.name
        });
        if (req.body.hash)
            user.hash = req.body.hash;
        UserService.update(user, (err, user) => {
            if (err)
                return next(err);
            res.status(200).end();
        });
    }
]

exports.delete = [
    // TODO add input sanitization
    (req, res, next) => {
        User.deleteOne({_id: req.params.id}, {}, (err) => {
            if (err)
                return next(err);
            res.status(200).end();
        })
    }
]