const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		maxlength: 50
	},
	description: {
		type: String
	},
	created_at : {
		type: Date,
		default: Date.now
	}
} , {
	collection: 'Roles'
});

module.exports = mongoose.model('Roles', roleSchema)