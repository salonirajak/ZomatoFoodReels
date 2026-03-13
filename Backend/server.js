const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "https://zomato-food-reels.vercel.app",
    credentials: true
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Check env variable
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Not found");

// Database connection
const connectDB = require("./src/db/db");
connectDB();

// Routes
const authRoutes = require("./src/routes/authRoutes");
const foodRoutes = require("./src/routes/foodRoutes");
const foodPartnerRoutes = require("./src/routes/foodPartnerRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/food-partner", foodPartnerRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Hello from Zomato backend server");
});

// Start server
let PORT = process.env.PORT || 3000;
let server;

function startServer() {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} busy, trying ${PORT + 1}`);
      PORT++;
      setTimeout(startServer, 1000);
    } else {
      console.error(err);
    }
  });
}

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  if (server) {
    server.close(() => {
      console.log("Server closed");
    });
  }
});

process.on("SIGINT", () => {
  console.log("SIGINT received");
  if (server) {
    server.close(() => {
      console.log("Server closed");
    });
  }
});