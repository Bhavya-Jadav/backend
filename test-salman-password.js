const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testSalmanPassword() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    const salman = await User.findOne({ username: 'salman' });
    if (!salman) {
      console.log('❌ User "salman" not found');
      process.exit(1);
    }
    
    console.log('🔍 Testing common passwords for user "salman":');
    console.log('Password hash:', salman.password);
    console.log('Last updated:', salman.updatedAt);
    console.log('---');
    
    // Test common passwords
    const testPasswords = [
      'password', 
      '123456', 
      'salman', 
      'salman123', 
      'newpassword',
      'password123',
      'admin',
      'company',
      'reset',
      '12345678',
      'salman@123'
    ];
    
    for (let pwd of testPasswords) {
      try {
        const match = await bcrypt.compare(pwd, salman.password);
        console.log(`Password '${pwd}': ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        if (match) {
          console.log(`\n🎉 FOUND WORKING PASSWORD: "${pwd}"`);
          console.log('You can now login with:');
          console.log(`Username: salman`);
          console.log(`Password: ${pwd}`);
          break;
        }
      } catch (error) {
        console.log(`Password '${pwd}': ❌ ERROR - ${error.message}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSalmanPassword();
