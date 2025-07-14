const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		maxlength: 100
	},
	description: {
		type: String
	},
	resource: {
		type: String,
		required: true,
		maxlength: 50
	},
	action: {
		type: String,
		required: true,
		maxlength: 50
	},
	created_at : {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Permission', permissionSchema)