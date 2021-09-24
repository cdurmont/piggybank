
import UserService from '../services/userService';
import {HeaderAPIKeyStrategy} from "passport-headerapikey";

const apiStrategy = new HeaderAPIKeyStrategy(
    {header: 'Authorization', prefix: 'Api-Key '},
    false,
    function(apikey, done) {
        UserService.loginApikey(apikey, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    }
)

export default apiStrategy;