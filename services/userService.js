const User = require('../models/user');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const saltRounds = 10;

const UserService = {

    /**
     * Creates a new user
     * @param newUser User to create. Put password in the hash field, it will be salted and hashed upon saving
     * @param callback (err, result:User)
     */
    create(newUser, callback) {
        // TODO check for duplicates
        // TODO validation
        this.saltHash(newUser, (err, newUser) => {
            if (err)
            {
                callback(err, null);
            }
            else
            {
                // persist user
                newUser.apikey = uuid.v4();
                newUser.save((err) => {
                    if (err) {
                        console.log('Error saving user ' + newUser);
                        return callback(err);
                    }
                    newUser.salt = null;
                    newUser.hash = null;
                    callback(null, newUser);
                });
            }
        });
    },

    /**
     * Retrieves the user list
     * @param filter not implemented !
     * @param callback (err, result:User[])
     */
    read(filter, callback) {
        User.find(filter, 'login name apikey')
            .exec(callback);
    },

    /**
     * Updates a user.
     * @param user
     * @param callback
     */
    update(user, callback) {
        // TODO add input sanitization
        // allow modification of some fields only
        let userUpdate = new User({
            _id: user.id,
            name: user.name,
            login: user.login
        });
        // update callback : persist modifications
        let updateCallback = (err, user) => {
            if (!err)
                User.updateOne({_id: user.id}, user, {}, callback);
            else
                callback(err, null);
        };
        // if a new password has been set for hash, salt&hash before updating
        if (user.hash)
        {
            userUpdate.hash = user.hash;
            this.saltHash(userUpdate, updateCallback);
        }
        else
            updateCallback(null, user);

    },

    delete(user, callback) {
        User.deleteOne({_id: user.id}, {}, callback);
    },

    // utilities

    saltHash(user, callback) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(user.hash, salt, (err, hash) => {
                if (!err)
                {
                    user.salt = salt;
                    user.hash = hash;
                    callback(null, user);
                }
                else
                    callback(err, null);
            })
        });
    }
}

module.exports = UserService;