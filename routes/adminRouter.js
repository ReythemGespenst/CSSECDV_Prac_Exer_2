const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const UserRole = require('../models/userrole');
const Role = require('../models/roles');
// const { requireAuth } = require('../middleware/auth');

const { updateUserRoles, getUserRoles } = require('../helpers/UserRoleHelper');
const { requireRole, requirePermission } = require('../middleware/auth');

// router.get('/dashboard', requireAuth, (req, res) => {
// 	res.render('dashboard', { username: req.session.username });
// });

router.post('/assign-roles', async (req, res) => {
	const { userId, roleIds } = req.body;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: 'Invalid userId' });
	}

	if (!Array.isArray(roleIds) || roleIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
		return res.status(400).json({ error: "Invalid roleIds" });
	}

	try {
		await updateUserRoles(userId, roleIds);
		res.redirect('/');
	} catch (err) {
		console.error(err);
		res.redirect('/');
	}

});

router.get('/users', requireRole(['admin', 'manager']), async (req, res) => {
	const username = req.session.user.username;
	const roles = []


	try {
		const users = await User.find();

		res.render('users', { username, users });
	} catch (err) {
		console.error(err);
		res.render('dashboard', { username, roles, error: 'An error occurred. Please try again.' });
	}
});

router.get('/delete', requireRole(['admin']), requirePermission('manage_users'), async (req, res) => {
	const username = req.session.user.username;

	try {
		// Fetch the logged-in admin user
		const adminUser = await User.findOne({ username: username });

		const roles = await getUserRoles(adminUser.id);

		// Fetch all users excluding the admin
		const users = await User.find({ _id: { $ne: adminUser._id } });

		res.render('delete', { username, users });
	} catch (err) {
		console.error(err);
		res.render('dashboard', { username, error: 'An error occurred. Please try again.' });
	}
});

router.post('/delete-user', async (req, res) => {
	const { userId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: 'Invalid userId' });
	}

	try {
		// Delete the user from the User schema
		await User.findByIdAndDelete(userId);

		// Delete the user's roles from the user_roles schema
		await UserRole.deleteMany({ user: userId });

		res.redirect('/admin/delete');
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete user' });
	}
});

router.get('/admin', requireRole(['admin']), async (req, res) => {
	const username = req.session.user.username;

	// Initialize roleList before the try block
	let roleList = [];
	let adminUser;

	try {
		// Fetch the logged-in admin user
		adminUser = await User.findOne({ username: username });

		if (!adminUser) {
			return res.render('dashboard', { username, roles: roleList, error: 'Admin user not found' });
		}

		// Fetch roles for the logged-in admin
		roleList = await getUserRoles(adminUser._id);

		// Fetch all users except the admin
		const users = await User.find({ _id: { $ne: adminUser._id } });

		// Fetch roles for each user
		const usersWithRoles = await Promise.all(
			users.map(async (user) => {
				const roles = await getUserRoles(user._id);
				return { user, roles };
			})
		);
		res.render('admin', { username, usersWithRoles });

	} catch (err) {
		console.error(err);
		res.render('dashboard', { username, roles: roleList, error: 'An error occurred. Please try again.' });
	}
});

router.post('/update-roles', requireRole(['admin']), async (req, res) => {
	const users = req.body.users;

	console.log(users)

	try {
		for (const userId in users) {
			const roleNames = users[userId].roleIds || [];

			const roleDocs = await Role.find({ name: { $in: roleNames } });

			await UserRole.deleteMany({ user: userId });

			const userRoleDocs = roleDocs.map(role => ({
				user: userId,
				role: role._id
			}));
			await UserRole.insertMany(userRoleDocs);
		}

		res.redirect('/dashboard');
	} catch (err) {
		console.error(err);
		res.status(500).send("Failed to update roles.");
	}
});

module.exports = router;