const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function adminResetPassword() {
  try {
    console.log('🔧 ADMIN PASSWORD RESET FOR USER: salman');
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    const salman = await User.findOne({ username: 'salman' });
    if (!salman) {
      console.log('❌ User "salman" not found');
      process.exit(1);
    }
    
    console.log('👤 Current user details:');
    console.log('Username:', salman.username);
    console.log('Role:', salman.role);
    console.log('Current password hash:', salman.password);
    console.log('Last updated:', salman.updatedAt);
    
    // Set the new password to "salmankhan" as you wanted
    const newPassword = 'salmankhan';
    console.log(`\n🔄 ADMIN RESET: Setting password to "${newPassword}"`);
    
    // Hash the password manually (bypassing the change-password validation)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New password hash:', hashedPassword);
    
    // Update directly in database
    const result = await User.updateOne(
      { username: 'salman' }, 
      { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    );
    
    console.log('Update result:', result);
    
    if (result.modifiedCount === 1) {
      console.log('✅ Password reset successful!');
      
      // Verify the password works
      const updatedUser = await User.findOne({ username: 'salman' });
      const passwordTest = await bcrypt.compare(newPassword, updatedUser.password);
      
      if (passwordTest) {
        console.log('✅ Password verification successful!');
        console.log('\n🎉 READY TO LOGIN:');
        console.log('====================');
        console.log('Username: salman');
        console.log('Password: salmankhan');
        console.log('Role: company');
        console.log('====================');
        console.log('\nYou can now login with these credentials!');
      } else {
        console.log('❌ Password verification failed!');
      }
    } else {
      console.log('❌ Password reset failed!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

adminResetPassword();
