// Simple password reset script
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // List all users first
    const users = await User.find({}, 'username role');
    console.log('\n📋 Available users:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });

    // Reset password for first user found (you can modify this)
    if (users.length > 0) {
      const user = users[0]; // Take first user
      console.log(`\n🔄 Resetting password for: ${user.username}`);
      
      // Set a simple password (change this to whatever you want)
      const newPassword = 'password123';
      
      const fullUser = await User.findById(user._id);
      fullUser.password = newPassword;
      await fullUser.save();
      
      console.log(`✅ Password reset successfully!`);
      console.log(`Username: ${user.username}`);
      console.log(`New Password: ${newPassword}`);
      console.log('\nYou can now login with these credentials.');
    } else {
      console.log('❌ No users found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPassword();
