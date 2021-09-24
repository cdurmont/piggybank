import User from '../models/user';
import bcrypt from 'bcrypt';
import {v4} from 'uuid';
import IUser from "../models/IUser";
import {NativeError, Types} from "mongoose";

const saltRounds = 10;

const UserService = {

    /**
     * Creates a new user
     * @param newUser User to create. Put password in the hash field, it will be salted and hashed upon saving
     * @param callback (err, result:User)
     */
    create(newUser: IUser, currentUser:IUser, callback: (err: object, user: IUser) => void) {
        if (!currentUser.admin)
            return callback({name:'Permission denied', message: 'User management restricted to admin users'}, null);
        // TODO check for duplicates
        this.saltHash(newUser, (err, newUser) => {
            if (err)
            {
                callback(err, null);
            }
            else
            {
                // persist user
                newUser.apikey = v4();
                let newUserModel = new User(newUser);
                newUserModel.save((err) => {
                    if (err) {
                        console.log('Error saving user ' + newUser);
                        return callback(err, null);
                    }
                    newUserModel.salt = null;
                    newUserModel.hash = null;
                    callback(null, newUserModel);
                });
            }
        });
    },

    /**
     * Retrieves the user list
     * @param filter
     * @param callback (err, result:User[])
     */
    read(filter: IUser, currentUser:IUser, callback: (err: object, userList: IUser[]) => void) {
        if (!currentUser.admin)
            return callback({name:'Permission denied', message: 'User management restricted to admin users'}, null);
        if (filter && filter._id) {
            User.findById(filter._id, 'login name admin apikey').exec((err, res) => { callback(err, [res])});
        }
        else
            User.find(filter, 'login name admin apikey')
                .exec(callback);
    },

    /**
     * Updates a user.
     * @param user
     * @param callback
     */
    update(user: IUser, currentUser:IUser, callback: (err: object, user: IUser) => void) {
        if (!currentUser.admin && !(user._id === currentUser._id))  // update allowed for admin and for self-updating (except upgrading to admin)
            return callback({name:'Permission denied', message: 'User management restricted to admin users'}, null);
        // allow modification of some fields only
        let userUpdate = new User({
            _id: user._id,
            name: user.name,
            login: user.login,
            admin: currentUser.admin ? user.admin : false   // if current user is not admin, do not let him self-promote as admin !
        });
        // update callback : persist modifications
        let updateCallback = (err: object, user: IUser) => {
            if (!err)
                User.updateOne({_id: user._id}, user, {}, callback);
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

    delete(user: IUser, currentUser:IUser, callback: (err: object) => void) {
        if (!currentUser.admin)
            return callback({name:'Permission denied', message: 'User management restricted to admin users'});
        User.deleteOne({_id: user._id}, {}, callback);
    },

    /**
     * Logs a user in. If successful returns full User instance, including apikey for further calls
     * @param user (login and password (set in the hash field))
     * @param callback (err, result:User)
     */
    login(user, callback) {
        User.findOne({login: user.login}, 'login salt hash name apikey admin', {},(err, userDB) => {
           if (err)
               return callback(err);
           if (!userDB)
               userDB = new User({salt: '$2b$10$m6HX0s25n9DrfVNNLnHSXu', hash:null}); // dummy user ! The user wasn't found but be proceed anyway...
           // the salt/hash is unsolvable no matter what the input is, but we still compute the hash
           // so that the time taken to handle a nonexistent user is the same as in the case on a wrong password
           // hash password and compare
           bcrypt.hash(user.hash, userDB.salt, (err, hash) => {
               if (err)
                   return callback(err);
               if (hash === userDB.hash)
               {
                   // password is valid, logging in...
                   userDB.salt = undefined;  // ... but keep salt&hash secret
                   userDB.hash = undefined;
                   return callback(null, userDB);
               }
               return callback();  // no error, no user = invalid user or password
           });
        });
    },

    /**
     * Authenticate user via apikey
     * @param apikey the apikey to authenticate against
     * @param callback (err, result:User)
     */
    loginApikey(apikey: string, callback: (err: NativeError, user:IUser) => void ) {
        User.findOne({apikey: apikey}, 'login name apikey admin', {}, callback);
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

export default UserService;