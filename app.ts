import express from 'express';

import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';

import config from './config/config';
import api from './routes/api-v1';
import loginStrategy from './config/security/loginStrategy';
import apiStrategy from './config/security/apiStrategy';


class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        // general middleware init
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(bodyParser.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, 'public')));

        // authentication setup
        passport.use(loginStrategy);
        passport.use(apiStrategy);

        // Route definitions
        this.app.use('/api-v1', api);

        // db setup
        const dbConn = config.DB_CONNECTION;
        mongoose.connect(dbConn, {useNewUrlParser: true, useUnifiedTopology: true, authSource: "admin" });
        mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
    }


}

export default App;

