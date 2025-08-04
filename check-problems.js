// Check problems in database
const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const User = require('./models/User'); // Need this for populate to work
require('dotenv').config();

const checkProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all problems
    const problems = await Problem.find({})
      .select('title company branch postedBy createdAt')
      .populate('postedBy', 'username role')
      .sort({ createdAt: -1 });

    console.log('\n📋 Problems in database:');
    console.log('==========================================');
    
    if (problems.length === 0) {
      console.log('❌ No problems found in database');
    } else {
      problems.forEach((problem, index) => {
        console.log(`${index + 1}. "${problem.title}"`);
        console.log(`   Company: ${problem.company}`);
        console.log(`   Branch: ${problem.branch}`);
        console.log(`   Posted by: ${problem.postedBy?.username || 'Unknown'} (${problem.postedBy?.role || 'Unknown role'})`);
        console.log(`   Posted on: ${problem.createdAt?.toLocaleDateString() || 'Unknown date'}`);
        console.log('---');
      });
    }
    
    console.log(`\nTotal problems found: ${problems.length}`);

    // Count by company
    const companyCounts = {};
    problems.forEach(problem => {
      const company = problem.company || 'Unknown';
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });

    console.log('\n📊 Problems by company:');
    Object.entries(companyCounts).forEach(([company, count]) => {
      console.log(`- ${company}: ${count} problem(s)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProblems();
