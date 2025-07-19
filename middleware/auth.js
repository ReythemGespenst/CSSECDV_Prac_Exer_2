const { getUserPermissions, userHasPermission } = require('../helpers/permissionHelper');
const { getUserRoles } = require('../helpers/UserRoleHelper');
const User = require('../models/user')

function requireRole(allowedRoles) {
	return async (req, res, next) => {
		try {

			const username = req.cookies.username;

			if (!username) {
				return res.redirect('/login');
			}

			const user = await User.findOne({ username: username });
			const roles = await getUserRoles(user._id);
			const hasPermission = roles.some(role => allowedRoles.includes(role));

			if (!hasPermission) {
				return res.status(403).json({ error: 'Insufficient permissions (role required) ' });
			}
			console.log('reached')
			next();

		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Authorization check failed' });
		}
	}
}

function requirePermission(requiredPermission) {
	return async (req, res, next) => {
		try {
			if (!req.user) {
				return res.status(401).json({ error: 'Authentication required' });
			}

			const hasPerm = await userHasPermission(req.user._id, requiredPermission);

			if (!hasPerm) {
				return res.status(403).json({ error: 'Insufficient permissions' });
			}

			next();
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Permission check failed' });
		}
	}
}

module.exports = {
	requireRole,
	requirePermission
};