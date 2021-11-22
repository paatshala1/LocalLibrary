const mongoose = require('mongoose');

// let userArgs = require('./populatedb');
// let uri = 'mongodb://127.0.0.1:27017/'.concat(userArgs);
// mongodb+srv://Sofi:<Hibou>@cluster0.hdhaw.mongodb.net/library?retryWrites=true&w=majority
// mongodb://127.0.0.1:27017/library

const uri = 'mongodb+srv://Sofi:Hibou@cluster0.hdhaw.mongodb.net/library?retryWrites=true&w=majority';

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', _ =>{
    console.log(`Mongoose has stablished a conexion to: ${uri}`);
});


module.exports = db;
