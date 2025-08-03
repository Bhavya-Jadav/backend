const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function listUsers() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    
    const users = await User.find({}, 'username role createdAt updatedAt');
    console.log('\nAll users in Atlas database:');
    console.log('==========================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log('---');
    });
    
    console.log(`\nTotal users found: ${users.length}`);
    
    // Now check specifically for salman
    const salman = await User.findOne({ username: 'salman' });
    if (salman) {
      console.log('\n🔍 User "salman" found:');
      console.log('Username:', salman.username);
      console.log('Role:', salman.role);
      console.log('Password hash:', salman.password);
      console.log('Updated:', salman.updatedAt);
    } else {
      console.log('\n❌ User "salman" not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
