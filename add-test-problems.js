const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

async function addTestProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/engineer_connect');
    console.log('Connected to MongoDB');

    // Add test problems with different branches
    const testProblems = [
      {
        company: 'Tech Solutions',
        branch: 'computer',
        title: 'Computer Science Algorithm Problem',
        description: 'Solve this complex algorithm challenge for computer science students.',
        difficulty: 'intermediate',
        tags: ['algorithm', 'computer-science', 'coding'],
        createdAt: new Date()
      },
      {
        company: 'Engineering Corp',
        branch: 'mechanical',
        title: 'Mechanical Engineering Design Challenge',
        description: 'Design an efficient mechanical system for industrial applications.',
        difficulty: 'advanced',
        tags: ['design', 'mechanical', 'engineering'],
        createdAt: new Date()
      },
      {
        company: 'ElectroTech',
        branch: 'electrical',
        title: 'Electrical Circuit Analysis',
        description: 'Analyze and optimize electrical circuits for power efficiency.',
        difficulty: 'beginner',
        tags: ['circuits', 'electrical', 'analysis'],
        createdAt: new Date()
      },
      {
        company: 'BuildCorp',
        branch: 'civil',
        title: 'Civil Engineering Structure Problem',
        description: 'Design a bridge structure that can withstand various loads.',
        difficulty: 'advanced',
        tags: ['structure', 'civil', 'bridge'],
        createdAt: new Date()
      }
    ];

    for (const problemData of testProblems) {
      const problem = new Problem(problemData);
      await problem.save();
      console.log(`✅ Created problem: "${problem.title}" with branch: "${problem.branch}"`);
    }

    console.log('\n🎉 All test problems created successfully!');
    
    // List all problems to verify
    const allProblems = await Problem.find({});
    console.log('\n📋 All problems in database:');
    allProblems.forEach(p => {
      console.log(`- "${p.title}" | Branch: "${p.branch}" | Company: "${p.company}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestProblems();
