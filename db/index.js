const mongoose = require('mongoose');
const { urlDb } = require('../config');

mongoose
	.connect(urlDb)
	.then(() => {
		console.log('Connection Success');
	})
	.catch((err) => console.log(err));

const db = mongoose.connection;
module.exports = db;
