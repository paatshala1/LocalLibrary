const mongoose = require('mongoose');

// let userArgs = require('./populatedb');
// let uri = 'mongodb://127.0.0.1:27017/'.concat(userArgs);
const uri = 'mongodb://127.0.0.1:27017/library';

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', _ =>{
    console.log(`Mongoose has stablished a conexion to: ${uri}`);
});


module.exports = db;
