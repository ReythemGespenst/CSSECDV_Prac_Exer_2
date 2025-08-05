const { getUserPermissions, userHasPermission } = require('../helpers/permissionHelper');
const { getUserRoles } = require('../helpers/UserRoleHelper');
const User = require('../models/user')

function requireRole(allowedRoles) {
	return async (req, res, next) => {
		try {

			if (!req.session || !req.session.user || !req.session.user.username) {
				console.error('Session or user is not initialized.');
				console.log('Redirecting 13');
				return res.redirect('/login');
			}

			const username = req.session.user.username;

			if (!username) {
				console.log('Redirecting 14');
				return res.redirect('/login');
			}

			const user = await User.findOne({ username: username });
			const roles = await getUserRoles(user._id);
			const hasPermission = roles.some(role => allowedRoles.includes(role));

			if (!hasPermission) {
				return res.status(403).json({ error: 'Insufficient permissions (role required) ' });
			}
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

			if (!res.headersSent && (!req.session || !req.session.user)) {
				console.error('Session or user is not initialized.');
				console.log('Redirecting 15');
				return res.redirect('/login');
			}

			const username = req.session.user.username;

			if (!username) {
				console.log('Redirecting 16');
				return res.redirect('/login');
			}

			const user = await User.findOne({ username: username });

			const hasPermission = await userHasPermission(user._id, requiredPermission)

			if (!hasPermission) {
				return res.status(403).json({ error: 'Insufficient permissions (permission required) ' });
			}
			next();

		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Authorization check failed' });
		}
	}
}
function isAuthenticated(req, res, next) {
    console.log('Checking session:', req.session);

    if (req.session && req.session.user) {
        console.log('Authenticated as:', req.session.user.username);
        return next();
    }

    console.log('Not authenticated, redirecting...');
	console.log('Redirecting 17');
    return res.redirect('/login');
}


// 	{
// 	try {
// 		if (!req.user) {
// 			return res.status(401).json({ error: 'Authentication required' });
// 		}

// 		const hasPerm = await userHasPermission(req.user._id, requiredPermission);

// 		if (!hasPerm) {
// 			return res.status(403).json({ error: 'Insufficient permissions' });
// 		}

// 		next();
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).json({ error: 'Permission check failed' });
// 	}
// }

module.exports = {
	requireRole,
	requirePermission,
	isAuthenticated
};