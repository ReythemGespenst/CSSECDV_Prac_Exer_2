const userRole = require('../models/userrole');
const role = require('../models/role');

// helper to remove all the current roles of the user
async function removeUserRoles(userId){
	await userRole.deleteMany({ user: userId});
}

// helper code to assign one role
async function assignUserRole(userId, roleId){
	await userRole.create({
		user: userId,
		role: roleId,
		assigned_at: new Date()
	});
}

//an admin level function for updating user roles
async function updateUserRoles(userId, roleIds){
	await removeUserRoles(userId);
	for (const roleId of roleIds){
		await assignUserRole(userId, roleId);
	}
}

async function getUserRoles(userId){
	const userRoles = await userRole.find({user: userId}).populate('role', 'name');
	return userRoles.map(ur => ur.role);
}

module.exports = {
	removeUserRoles,
	assignUserRole,
	updateUserRoles,
	getUserRoles
}