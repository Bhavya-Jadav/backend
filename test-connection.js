// test-connection.js - Test MongoDB connection for deployment
const mongoose = require('mongoose');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is not set');
  process.exit(1);
}

console.log('🔍 Testing MongoDB connection...');
console.log('📍 MongoDB URI:', MONGO_URI.replace(/\/\/(.+)@/, '//***:***@')); // Hide credentials

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connection successful!');
  console.log('📊 Connection state:', mongoose.connection.readyState);
  console.log('🏷️  Database name:', mongoose.connection.name);
  
  // Test a simple query
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ MongoDB ping successful!');
  console.log('🎉 Database is ready for production deployment');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:');
  console.error('Error:', error.message);
  console.error('\n🔧 Troubleshooting steps:');
  console.error('1. Check your MongoDB Atlas Network Access settings');
  console.error('2. Verify the connection string is correct');
  console.error('3. Ensure your MongoDB cluster is running');
  console.error('4. Check if IP whitelist includes 0.0.0.0/0 for Vercel');
  process.exit(1);
});
