const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./src/db/db"); 

const app = express();

connectDB();  

app.use(
  cors({
    origin: "https://zomato-food-reels.vercel.app",
    credentials: true
  })
);

app.use(express.json());

// static folder for videos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const foodRoutes = require("./src/routes/foodRoutes");
const authRoutes = require("./src/routes/authRoutes");

app.use("/api/food", foodRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});