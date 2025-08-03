// Cleanup script to remove default video URLs from existing problems
const mongoose = require('mongoose');
require('dotenv').config();

const problemSchema = new mongoose.Schema({
  company: String,
  branch: String,
  title: String,
  description: String,
  videoUrl: String,
  attachments: [{
    fileName: String,
    originalName: String,
    fileType: String,
    fileSize: Number,
    filePath: String,
    uploadedAt: Date
  }],
  tags: [String],
  difficulty: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Problem = mongoose.model('Problem', problemSchema);

async function cleanupVideoUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all problems with the default video URL
    const defaultVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    const problemsToUpdate = await Problem.find({ 
      videoUrl: defaultVideoUrl 
    });
    
    console.log(`Found ${problemsToUpdate.length} problems with default video URL`);

    if (problemsToUpdate.length > 0) {
      // Update all problems to remove the default video URL
      const result = await Problem.updateMany(
        { videoUrl: defaultVideoUrl },
        { $unset: { videoUrl: "" } } // Remove the videoUrl field entirely
      );

      console.log(`✅ Updated ${result.modifiedCount} problems`);
      console.log('Default video URLs have been removed from existing problems');
    } else {
      console.log('No problems found with default video URL');
    }

    // List remaining problems for verification
    const allProblems = await Problem.find({}, 'title company videoUrl attachments');
    console.log('\nCurrent problems in database:');
    allProblems.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.title} - Company: ${problem.company}`);
      console.log(`   Video URL: ${problem.videoUrl || 'None'}`);
      console.log(`   Attachments: ${problem.attachments ? problem.attachments.length : 0} files`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the cleanup
cleanupVideoUrls();
