// Complete cleanup script - removes all problems and starts fresh
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

async function completeCleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get count before deletion
    const beforeCount = await Problem.countDocuments();
    console.log(`Found ${beforeCount} problems in database`);

    if (beforeCount > 0) {
      // Delete ALL problems to start completely fresh
      const deleteResult = await Problem.deleteMany({});
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} problems`);
      console.log('✅ Database is now clean - ready for fresh problem uploads!');
    } else {
      console.log('✅ Database is already clean');
    }

    // Verify cleanup
    const afterCount = await Problem.countDocuments();
    console.log(`Final count: ${afterCount} problems remaining`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the complete cleanup
completeCleanup();
