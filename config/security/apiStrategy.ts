import {Strategy} from 'passport-localapikey';

import UserService from '../../services/userService';

const apiStrategy = new Strategy(
    function(apikey, done) {
        UserService.loginApikey(apikey, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    }
)

export default apiStrategy;