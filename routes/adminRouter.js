const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const {updateUserRoles} = require('../helpers/UserRoleHelper');

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

module.exports = router;