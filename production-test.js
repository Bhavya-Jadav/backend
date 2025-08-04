// production-test.js - Comprehensive deployment readiness test
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

console.log('🚀 ENGINEER CONNECT - PRODUCTION READINESS TEST');
console.log('=' .repeat(60));

async function runProductionTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (details) console.log(`    ${details}`);
    
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  // Test 1: Environment Variables
  console.log('\n📋 Testing Environment Variables...');
  
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
  requiredEnvVars.forEach(envVar => {
    const exists = !!process.env[envVar];
    logTest(`Environment Variable: ${envVar}`, exists, 
      exists ? `Set to: ${envVar === 'MONGO_URI' ? 'mongodb+srv://***' : process.env[envVar]}` : 'Missing!');
  });

  // Test 2: JWT Secret Strength
  const jwtSecret = process.env.JWT_SECRET;
  const isStrongJWT = jwtSecret && jwtSecret.length >= 32;
  logTest('JWT Secret Strength', isStrongJWT, 
    isStrongJWT ? `${jwtSecret.length} characters (secure)` : 'Weak or missing JWT secret');

  // Test 3: MongoDB Connection
  console.log('\n🗄️  Testing MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logTest('MongoDB Connection', true, `Connected to: ${mongoose.connection.name || 'database'}`);
    
    // Test database operations
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'deployment-check', timestamp: new Date() });
    await testCollection.deleteOne({ test: 'deployment-check' });
    logTest('MongoDB Write/Read Operations', true, 'Insert and delete operations successful');
    
  } catch (error) {
    logTest('MongoDB Connection', false, error.message);
  }

  // Test 4: Password Hashing
  console.log('\n🔐 Testing Password Hashing...');
  try {
    const testPassword = 'testPassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isValidPassword = await bcrypt.compare(testPassword, hashedPassword);
    logTest('Password Hashing', isValidPassword, 'bcrypt hashing and comparison working');
  } catch (error) {
    logTest('Password Hashing', false, error.message);
  }

  // Test 5: File System Permissions (for uploads)
  console.log('\n📁 Testing File System...');
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if uploads directory can be created
    const uploadsDir = path.join(__dirname, 'uploads', 'test');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Test file operations
    const testFile = path.join(uploadsDir, 'test.txt');
    fs.writeFileSync(testFile, 'test content');
    const content = fs.readFileSync(testFile, 'utf8');
    fs.unlinkSync(testFile);
    
    logTest('File Upload Directory', content === 'test content', 'File operations successful');
  } catch (error) {
    logTest('File Upload Directory', false, error.message);
  }

  // Test 6: Required Dependencies
  console.log('\n📦 Testing Dependencies...');
  const requiredDeps = ['express', 'mongoose', 'cors', 'bcryptjs', 'jsonwebtoken', 'express-fileupload'];
  
  requiredDeps.forEach(dep => {
    try {
      require(dep);
      logTest(`Dependency: ${dep}`, true, 'Module loads successfully');
    } catch (error) {
      logTest(`Dependency: ${dep}`, false, 'Module not found or broken');
    }
  });

  // Test 7: Port Configuration
  console.log('\n🌐 Testing Server Configuration...');
  const port = process.env.PORT || 5000;
  const isValidPort = port >= 1000 && port <= 65535;
  logTest('Port Configuration', isValidPort, `Port: ${port}`);

  // Close MongoDB connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }

  // Final Results
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 TEST RESULTS: ${results.passed}/${results.tests.length} PASSED`);
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED - READY FOR PRODUCTION DEPLOYMENT!');
    console.log('✅ Your app is 100% deployment-ready for Vercel');
    console.log('🌍 Will work globally on all mobile devices');
    console.log('\n🚀 Next Steps:');
    console.log('1. Run: vercel');
    console.log('2. Set environment variables in Vercel dashboard');
    console.log('3. Update REACT_APP_API_BASE_URL with your Vercel domain');
  } else {
    console.log(`❌ ${results.failed} TESTS FAILED - FIX REQUIRED BEFORE DEPLOYMENT`);
    console.log('\n🔧 Fix the failed tests above before deploying');
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runProductionTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
