const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	role: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Roles',
		required: true
	},
	assigned_at: {
		type: Date,
		default: Date.now
	}
}, {
	collection: 'User_Roles'
});

userRoleSchema.index({ user: 1, role: 1}, {unique: true});

module.exports = mongoose.model('User_Roles', userRoleSchema);