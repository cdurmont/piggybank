const LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

const UserService = require('../../services/userService');

const apiStrategy = new LocalAPIKeyStrategy(
    function(apikey, done) {
        UserService.loginApikey(apikey, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    }
)

module.exports = apiStrategy;