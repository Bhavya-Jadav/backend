const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testSalmanLogin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    const salman = await User.findOne({ username: 'salman' });
    if (!salman) {
      console.log('❌ User "salman" not found');
      process.exit(1);
    }
    
    console.log('🔍 Testing login for user "salman":');
    console.log('Username:', salman.username);
    console.log('Role:', salman.role);
    console.log('Password hash:', salman.password);
    console.log('Last updated:', salman.updatedAt);
    console.log('---');
    
    // Test the new password "salmankhan"
    const newPassword = 'salmankhan';
    console.log(`Testing password: "${newPassword}"`);
    
    const match = await bcrypt.compare(newPassword, salman.password);
    console.log(`Password '${newPassword}': ${match ? '✅ MATCH - LOGIN SHOULD WORK!' : '❌ NO MATCH'}`);
    
    if (match) {
      console.log('\n🎉 LOGIN CREDENTIALS:');
      console.log('Username: salman');
      console.log('Password: salmankhan');
      console.log('Role: company');
      console.log('\nYou should be able to login with these credentials now!');
    } else {
      console.log('\n❌ The password "salmankhan" does not match the stored hash.');
      console.log('There might be an issue with how the password was updated.');
      
      // Let's also test the old password "salman"
      const oldMatch = await bcrypt.compare('salman', salman.password);
      console.log(`Testing old password "salman": ${oldMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSalmanLogin();
