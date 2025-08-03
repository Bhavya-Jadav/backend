const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetSalmanPassword() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    const salman = await User.findOne({ username: 'salman' });
    if (!salman) {
      console.log('❌ User "salman" not found');
      process.exit(1);
    }
    
    console.log('🔍 Current user details:');
    console.log('Username:', salman.username);
    console.log('Role:', salman.role);
    console.log('Current password hash:', salman.password);
    console.log('Last updated:', salman.updatedAt);
    
    // Set new password
    const newPassword = 'newpassword123';
    console.log(`\n🔄 Setting new password to: "${newPassword}"`);
    
    // Hash the new password manually (same as the pre-save hook would do)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password directly
    await User.findByIdAndUpdate(salman._id, { 
      password: hashedPassword,
      updatedAt: new Date()
    });
    
    console.log('✅ Password updated successfully!');
    
    // Verify the new password works
    const updatedUser = await User.findOne({ username: 'salman' });
    const passwordMatch = await bcrypt.compare(newPassword, updatedUser.password);
    
    if (passwordMatch) {
      console.log('✅ Password verification successful!');
      console.log('\n🎉 Login credentials for salman:');
      console.log('Username: salman');
      console.log(`Password: ${newPassword}`);
      console.log('Role: company');
    } else {
      console.log('❌ Password verification failed!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetSalmanPassword();
