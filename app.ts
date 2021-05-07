import express from 'express';

import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
import {ToadScheduler, Task, SimpleIntervalJob} from "toad-scheduler";

import config from './config/config';
import api from './routes/api-v1';
import apiStrategy from './config/apiStrategy';
import TransactionService from "./services/transactionService";


class App {
    public app: express.Application;
    scheduler: ToadScheduler;

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
        passport.use(apiStrategy);

        // Route definitions
        this.app.use('/api-v1', api);

        // db setup
        const dbConn = config.DB_CONNECTION;
        mongoose.connect(dbConn, {useNewUrlParser: true, useUnifiedTopology: true, authSource: "admin" });
        mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

        // recurring transactions scheduler
        this.scheduler = new ToadScheduler();
        let task = new Task('recur', () => {TransactionService.genRecurringTransactions()});
        this.scheduler.addSimpleIntervalJob(new SimpleIntervalJob({hours: 4}, task));   // check recurring txns 3x a day, more than enough
        // also check at startup just in case
        TransactionService.genRecurringTransactions();
    }


}

export default App;

