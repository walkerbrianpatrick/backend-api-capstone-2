// get local environment variables
require('dotenv').config();
// import the required modules
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');

// import the apiRouter
const apiRouter = require('./server/api');


// grap the port number from environment variables, or assign 4000 if missing
const PORT = process.env.PORT || 4000;

// open up the database for use
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
// to enforce foreign key constraints, it needs to be turned on when you connect
db.run('PRAGMA foreign_keys = ON');

// add the json body parser
app.use(bodyParser.json());
// include morgan development logging
app.use(morgan('dev'));
// add the error handler module
app.use(errorHandler());

// Debug stuff

console.log(process.env.TEST_DATABASE);
console.log(process.env.PORT);


// Routes
// Mount the api router at path /ai
app.use('/api', apiRouter);

// fire up the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


module.exports = app;
