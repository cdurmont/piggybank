const BasicStrategy = require('passport-http').BasicStrategy;

const UserService = require('../../services/userService');
const User = require('../../models/user');

const loginStrategy = new BasicStrategy(
    function(username, password, done) {
        let user = new User({
            login: username,
            hash: password
        })
        UserService.login(user, (err, user) => {
            if (err)
                return done(err);
            if (!user)
                return done(null, false);
            return done(null, user);
        });
    }
);

module.exports = loginStrategy;