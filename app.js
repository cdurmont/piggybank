const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// general middleware init
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route definitions
app.use('/api-v1', require('./routes/api-v1'));
app.use('/', require('./routes/index'));

// db setup
const dbConn = config.DB_CONNECTION;
mongoose.connect(dbConn, {useNewUrlParser: true, useUnifiedTopology: true, authSource: "admin" });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


module.exports = app;
