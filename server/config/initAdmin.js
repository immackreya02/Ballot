const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initSuperAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ballot.org').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'BallotSystemSuperAdmin2026!';

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      // Check if any admin exists
      const anyAdmin = await User.findOne({ role: 'admin' });
      if (anyAdmin) {
        console.log(`[Super Admin] Admin profile already active: ${anyAdmin.email}`);
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      adminUser = new User({
        name: 'System Super Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
        isEmailVerified: true
      });

      await adminUser.save();
      console.log('==================================================');
      console.log('✓ SUPER ADMIN PROFILE INITIALIZED:');
      console.log(`  Email:    ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log('==================================================');
    } else {
      console.log(`[Super Admin] Super Admin profile verified: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[Super Admin] Initialization Error:', err.message);
  }
};

module.exports = { initSuperAdmin };
