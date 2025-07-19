const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const UserRole = require('../models/userrole');
const Role = require('../models/roles');

const {updateUserRoles, getUserRoles} = require('../helpers/UserRoleHelper');
const { requireRole } = require('../middleware/auth');

router.post('/assign-roles', async (req,res) => {
	const { userId, roleIds } = req.body;

	if(!mongoose.Types.ObjectId.isValid(userId)){
		return res.status(400).json({error: 'Invalid userId'});
	}

	if(!Array.isArray(roleIds) || roleIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
		return res.status(400).json({error: "Invalid roleIds"});
	}

	try {
		await updateUserRoles(userId, roleIds);
		res.redirect('/');
	} catch (err) {
		console.error(err);
		res.redirect('/');
	}

});

router.get('/users',  requireRole(['admin', 'manager']), async (req, res) => {
	const username = req.cookies.username;
	const roles = []


	try {
		const users = await User.find();



// success case

		res.render('users', { username, users });
	} catch (err) {
		console.error(err);
		res.render('dashboard', { username, roles, error: 'An error occurred. Please try again.' });
	}
});

module.exports = router;