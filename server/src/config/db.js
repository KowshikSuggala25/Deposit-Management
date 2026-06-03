const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not configured.");
  }

  await mongoose.connect(mongoURI);
  return mongoose.connection;
};

module.exports = connectDB;
