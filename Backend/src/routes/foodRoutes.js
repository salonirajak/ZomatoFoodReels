const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Food = require("../models/food.model");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// upload food
router.post("/", upload.single("video"), async (req, res) => {

  try {

    const food = new Food({
      name: req.body.name,
      description: req.body.description,
      video: "/uploads/" + req.file.filename
    });

    await food.save();

    res.json(food);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

// get foods
router.get("/", async (req, res) => {

  const foods = await Food.find();

  res.json({
    foodItems: foods
  });

});

module.exports = router;