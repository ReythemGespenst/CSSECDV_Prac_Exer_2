require('dotenv').config();

const mongoose = require("mongoose");

const Role = require('../models/roles');
const Permission = require('../models/permissions');
const RolePermission = require('../models/rolepermissions');

const uri = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log('connected to DB');

    const roleCount = await Role.countDocuments();
    if (roleCount > 0) {
      console.log('ℹ️ Roles already exist, skipping');
    } else {
      await Role.insertMany([
        { name: 'admin', description: 'Full system administrator' },
        { name: 'manager', description: 'Manager' },
        { name: 'user', description: 'Standard user' },
      ]);
      console.log('roles inserted');
    }

    const permissionCount = await Permission.countDocuments();
    if (permissionCount > 0) {
      console.log('ℹ️ Permissions already exist, skipping');
    } else {
      await Permission.insertMany([
        { name: 'view_dashboard', description: 'Access to dashboard', resource: 'dashboard', action: 'read' },
        { name: 'manage_users', description: 'Manage users', resource: 'users', action: 'manage' },
        { name: 'view_users', description: 'View users', resource: 'users', action: 'read' },
        { name: 'edit_profile', description: 'Edit own profile', resource: 'profile', action: 'update' },
        { name: 'admin_access', description: 'Admin functions', resource: 'admin', action: 'access' },
      ]);
      console.log('permissions inserted');
    }

    const roles = await Role.find();
    const permissions = await Permission.find();

    const roleMap = Object.fromEntries(roles.map(r => [r.name, r._id]));
    const permMap = Object.fromEntries(permissions.map(p => [p.name, p._id]));

    if (await RolePermission.countDocuments() === 0) {
      await RolePermission.insertMany([
        { role: roleMap.admin, permission: permMap.view_dashboard },
        { role: roleMap.admin, permission: permMap.manage_users },
        { role: roleMap.admin, permission: permMap.view_users },
        { role: roleMap.admin, permission: permMap.edit_profile },
        { role: roleMap.admin, permission: permMap.admin_access },

        { role: roleMap.manager, permission: permMap.view_dashboard },
        { role: roleMap.manager, permission: permMap.manage_users },
        { role: roleMap.manager, permission: permMap.view_users },
        { role: roleMap.manager, permission: permMap.edit_profile },

        { role: roleMap.user, permission: permMap.view_dashboard },
        { role: roleMap.user, permission: permMap.edit_profile },
      ]);
      console.log('rolePermissions inserted');
    } else {
      console.log('rolePermissions already exist, skipping');
    }

    await mongoose.disconnect();
    console.log('finished seeding');
    process.exit(0);

  } catch (err) {
    console.error('error:x', err);
    process.exit(1);
  }
}

seed();