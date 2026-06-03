const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const app = require("./app");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
