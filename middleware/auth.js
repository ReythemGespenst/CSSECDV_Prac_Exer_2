const {getUserPermissions, userHasPermission} = require('../helpers/permissionHelper');
const {getUserRoles} = require('../helpers/UserRoleHelper');

function requireRole(allowedRoles) {
	return async(req, res, next) => {
		try {
			if(!req.user){
				return;
			}

			const roles = await getUserRoles(req.user._id);
			const roleNames = roles.map(r => r.name);

			const hasRole = allowedRoles.some(role => roleNames.includes(role));

			if(!hasRole) {
				return res.status(403).json({error: 'Insufficient permissions (role required) '});
			}

			next();
 		} catch (err) {
 			console.error(err);
 			res.status(500).json({error: 'Authorization check failed'});
 		}
	}
}

function requirePermission(requiredPermission) {
	return async (req, res, next) => {
		try {
			if (!req.user) {
				return res.status(401).json({error: 'Authentication required'});
			}

			const hasPerm = await userHasPermission(req.user._id, requiredPermission);

			if (!hasPerm) {
				return res.status(403).json({error: 'Insufficient permissions'});
			}

			next();
		} catch (err) {
			console.error(err);
			res.status(500).json({error: 'Permission check failed'});
		}
	}
}

module.exports = {
	requireRole,
	requirePermission
};