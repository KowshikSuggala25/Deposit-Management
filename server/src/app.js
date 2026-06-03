const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bankRoutes = require("./routes/bankRoutes");
const holderRoutes = require("./routes/holderRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/holders", holderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
