import {BasicStrategy} from 'passport-http';
import UserService from '../../services/userService';
import User from '../../models/user';

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

export default loginStrategy;