const mongoose = require("mongoose");

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✓ MongoDB Connected");

  } catch (error) {

    console.error("✗ MongoDB Connection Failed:");
    console.error("Error:", error.message);
    console.error("URI:", process.env.MONGO_URI);
    process.exit(1);

  }
};

module.exports = connectDB;