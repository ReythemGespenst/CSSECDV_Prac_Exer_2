const userRole = require('../models/userrole');
const rolePermission = require('../models/rolepermissions');
const permission = require('../models/permissions');

async function getUserPermissions(userId) {
	const userRoles = await userRole.find({user: userId}).select('role');
	const roleIds = userRoles.map(ur => ur.role);

	if (!roleIds.length) return [];

	const rolePerms = await rolePermission.find({role: {$in: roleIds}}).select('permission');
	const permIds = rolePerms.map(rp => rp.permission);

	if(!permIds.length) return [];

	const permissions = await permission.find({ _id: {$in: permIds}}).select('name');
	return permissions.map(p => p.name);
}

async function userHasPermission(userId, requiredPermission){
	const permissions = await getUserPermissions(userId);
	return permissions.includes(requiredPermission);
}

module.exports = {
	getUserPermissions,
	userHasPermission
};