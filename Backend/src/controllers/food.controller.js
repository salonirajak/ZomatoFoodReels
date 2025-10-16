const storageService = require('../services/storage.service');
const { v4: uuid } = require("uuid")
const mongoose = require('mongoose');
const path = require('path');

async function createFood(req, res) {
    try {
        // Import models only when needed
        const foodModel = require('../models/food.model');
        
        console.log('Creating food item');
        console.log('Request file:', req.file);
        console.log('Request body:', req.body);
        console.log('Food partner:', req.foodpartner);
        
        // Check if file was uploaded
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({
                message: "No video file uploaded"
            });
        }
        
        // Check if food partner is authenticated
        if (!req.foodpartner) {
            console.log('Food partner not authenticated');
            return res.status(401).json({
                message: "Food partner not authenticated"
            });
        }

        // Validate required fields
        if (!req.body.name || !req.body.name.trim()) {
            return res.status(400).json({
                message: "Food name is required"
            });
        }

        // Validate name length
        const name = req.body.name.trim();
        if (name.length > 100) {
            return res.status(400).json({
                message: "Food name must be less than 100 characters"
            });
        }

        // Validate description length if provided
        let description = '';
        if (req.body.description) {
            description = req.body.description.trim();
            if (description.length > 500) {
                return res.status(400).json({
                    message: "Description must be less than 500 characters"
                });
            }
        }

        // Generate filename with .mp4 extension
        const filename = `${uuid()}.mp4`;
        console.log(`Generated filename: ${filename}`);
        
        const fileUploadResult = await storageService.uploadFile(req.file.buffer, filename);
        console.log('File upload result:', fileUploadResult);

        // Use the model (either MongoDB or in-memory)
        console.log('=== Debug Info ===');
        console.log('Mongoose connection state:', mongoose.connection.readyState);
        console.log('Food model useInMemory:', foodModel.getUseInMemory ? foodModel.getUseInMemory() : 'Not available');
        console.log('Should use in-memory:', 
            foodModel.getUseInMemory ? foodModel.getUseInMemory() : 
            (mongoose.connection.readyState !== 1));
        
        const foodItem = await foodModel.create({
            name: name,
            description: description,
            video: fileUploadResult.url,
            foodpartner: req.foodpartner._id
        });
        
        console.log('Food item created:', foodItem);

        res.status(201).json({
            message: "Food created successfully",
            food: foodItem
        });
    } catch (error) {
        console.error("Error creating food item:", error);
        // Send different status codes based on error type
        if (error.message.includes('validation')) {
            res.status(400).json({
                message: "Validation error",
                error: error.message
            });
        } else if (error.message.includes('upload')) {
            res.status(400).json({
                message: "File upload error",
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "Error creating food item",
                error: error.message
            });
        }
    }
}

async function getFoodItems(req,res) {
    try {
        // Import models only when needed
        const foodModel = require('../models/food.model');
        
        console.log('Fetching food items');
        
        // Debug info
        console.log('=== Debug Info ===');
        console.log('Mongoose connection state:', mongoose.connection.readyState);
        console.log('Food model useInMemory:', foodModel.getUseInMemory ? foodModel.getUseInMemory() : 'Not available');
        console.log('Should use in-memory:', 
            foodModel.getUseInMemory ? foodModel.getUseInMemory() : 
            (mongoose.connection.readyState !== 1));
        
        // Check if we're using in-memory storage and if it has data
        if (foodModel.getUseInMemory && foodModel.getUseInMemory()) {
            console.log('Using in-memory storage. Checking for data...');
            const allItems = await foodModel.find({});
            console.log('Total items in in-memory storage:', allItems.length);
        }
        
        // Use the model (either MongoDB or in-memory)
        // Add more detailed logging
        console.log('About to call foodModel.find');
        let foodItems = await foodModel.find({});
        // Populate foodpartner data
        foodItems = await foodModel.populate(foodItems, { path: 'foodpartner', select: 'name _id' });
        console.log('Found', foodItems.length, 'food items');
        
        // Process video URLs to ensure they have the correct format
        const processedFoodItems = foodItems.map(item => {
            let videoUrl = item.video;
            
            // If video URL is a local file path, construct the full URL
            if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('/uploads/')) {
                // Check if it already has an extension
                if (!path.extname(videoUrl)) {
                    videoUrl = `/uploads/${videoUrl}.mp4`;
                } else {
                    videoUrl = `/uploads/${videoUrl}`;
                }
            } else if (videoUrl && videoUrl.startsWith('uploads/')) {
                videoUrl = `/${videoUrl}`;
            }
            
            // Ensure foodpartner is properly formatted for frontend
            let foodPartnerData = null;
            if (item.foodpartner) {
                foodPartnerData = {
                    _id: item.foodpartner._id || item.foodpartner,
                    name: item.foodpartner.name || "Food Partner"
                };
            }
            
            // Log the item being processed
            console.log('Processing item:', {
                original: item,
                description: item.description,
                descriptionType: typeof item.description,
                hasDescription: !!item.description
            });
            
            // Create a new object with all properties explicitly defined
            return { 
                _id: item._id,
                name: item.name,
                description: item.description,
                video: videoUrl,
                foodpartner: foodPartnerData,
                likeCount: item.likeCount,
                savesCount: item.savesCount,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            };
        });
        
        console.log('Food items:', processedFoodItems.map(item => ({
            id: item._id,
            name: item.name,
            video: item.video,
            description: item.description,
            descriptionType: typeof item.description,
            descriptionLength: item.description ? item.description.length : 0,
            hasDescription: !!item.description,
            foodpartner: item.foodpartner
        })));
        
        res.status(200).json({
            message: "Food items fetched successfully",
            foodItems: processedFoodItems
        });
    } catch (error) {
        console.error("Error fetching food items:", error);
        // Add more detailed error logging
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({
            message: "Error fetching food items",
            error: error.message
        });
    }
}

async function likeFood(req, res) {
    try {
        // Import models only when needed
        const likeModel = require("../models/likes.model");
        const foodModel = require('../models/food.model');
        
        console.log('=== LIKE FOOD REQUEST ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        console.log('Request headers:', req.headers);
        
        // Check if user is authenticated
        if (!req.user) {
            console.log('ERROR: User not authenticated - req.user is missing');
            return res.status(401).json({
                message: "User not authenticated - please login first"
            });
        }
        
        const { foodId } = req.body;
        const user = req.user;
        
        console.log('Like request received:', { foodId, userId: user._id });
        
        // More detailed validation
        if (!foodId) {
            console.log('ERROR: foodId is missing from request body');
            return res.status(400).json({
                message: "foodId is required",
                receivedBody: req.body
            });
        }
        
        // Validate that foodId is a string
        if (typeof foodId !== 'string') {
            console.log('ERROR: foodId is not a string:', typeof foodId);
            return res.status(400).json({
                message: "foodId must be a string",
                receivedFoodId: foodId,
                type: typeof foodId
            });
        }
        
        // Validate that user exists
        if (!user || !user._id) {
            console.log('ERROR: User not authenticated');
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const isAlreadyLiked = await likeModel.findOne({
            user: user._id,
            food: foodId
        });
        
        console.log('Is already liked:', isAlreadyLiked);

        if (isAlreadyLiked) {
            console.log('Removing like');
            await likeModel.deleteOne({
                user: user._id,
                food: foodId
            });

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { likeCount: -1 }
            });

            return res.status(200).json({
                message: "Food unliked successfully",
                like: null
            });
        }

        console.log('Adding like');
        const like = await likeModel.create({
            user: user._id,
            food: foodId
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: 1 }
        });

        res.status(201).json({
            message: "Food liked successfully",
            like: like
        });
    } catch (error) {
        console.error("Error in likeFood:", error);
        // Add more detailed error information
        console.error("Error stack:", error.stack);
        res.status(500).json({
            message: "Error processing like request",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

async function saveFood(req, res) {
    try {
        // Import models only when needed
        const saveModel = require("../models/save.model");
        const foodModel = require('../models/food.model');
        
        console.log('=== SAVE FOOD REQUEST ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        console.log('Request headers:', req.headers);
        
        const { foodId } = req.body;
        const user = req.user;
        
        console.log('Save request received:', { foodId, userId: user._id });

        // Check if user is authenticated
        if (!req.user) {
            console.log('ERROR: User not authenticated - req.user is missing');
            return res.status(401).json({
                message: "User not authenticated - please login first"
            });
        }
        
        // More detailed validation
        if (!foodId) {
            console.log('ERROR: foodId is missing from request body');
            return res.status(400).json({
                message: "foodId is required",
                receivedBody: req.body
            });
        }
        
        // Validate that foodId is a string
        if (typeof foodId !== 'string') {
            console.log('ERROR: foodId is not a string:', typeof foodId);
            return res.status(400).json({
                message: "foodId must be a string",
                receivedFoodId: foodId,
                type: typeof foodId
            });
        }
        
        // Validate that user exists
        if (!user || !user._id) {
            console.log('ERROR: User not authenticated');
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const isAlreadySaved = await saveModel.findOne({
            user: user._id,
            food: foodId
        });
        
        console.log('Is already saved:', isAlreadySaved);

        if (isAlreadySaved) {
            console.log('Removing save');
            await saveModel.deleteOne({
                user: user._id,
                food: foodId
            });

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { savesCount: -1 }
            });

            return res.status(200).json({
                message: "Food unsaved successfully",
                save: null
            });
        }

        console.log('Adding save');
        const save = await saveModel.create({
            user: user._id,
            food: foodId
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: 1 }
        });

        res.status(201).json({
            message: "Food saved successfully",
            save: save
        });
    } catch (error) {
        console.error("Error in saveFood:", error);
        res.status(500).json({
            message: "Error processing save request",
            error: error.message
        });
    }
}

async function getSaveFood(req, res) {
    try {
        // Import models only when needed
        const saveModel = require("../models/save.model");
        
        const user = req.user;
        console.log('Get saved foods request for user:', user._id);

        const savedFoods = await saveModel.find({ user: user._id });

        if (!savedFoods || savedFoods.length === 0) {
            return res.status(404).json({ message: "No saved foods found" });
        }

        res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods
        });
    } catch (error) {
        console.error("Error in getSaveFood:", error);
        res.status(500).json({
            message: "Error retrieving saved foods",
            error: error.message
        });
    }
}

// Add function to get a specific food item by ID
async function getFoodItemById(req, res) {
    try {
        // Import models only when needed
        const foodModel = require('../models/food.model');
        
        const { id } = req.params;
        console.log('Fetching food item by ID:', id);
        console.log('Request params:', req.params);
        console.log('Request query:', req.query);
        
        // Validate the ID format
        if (!id) {
            return res.status(400).json({
                message: "Food ID is required"
            });
        }
        
        // Check if ID contains invalid characters like colons
        if (id.includes(':')) {
            return res.status(400).json({
                message: "Invalid food ID format. ID should not contain colons."
            });
        }

        const foodItem = await foodModel.findById(id);
        
        if (!foodItem) {
            return res.status(404).json({
                message: "Food item not found"
            });
        }

        // Process video URL to ensure it has the correct format
        let videoUrl = foodItem.video;
        if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('/uploads/')) {
            videoUrl = `/uploads/${videoUrl}`;
        } else if (videoUrl && videoUrl.startsWith('uploads/')) {
            videoUrl = `/${videoUrl}`;
        }
        
        // Ensure foodpartner is properly formatted for frontend
        let foodPartnerData = null;
        if (foodItem.foodpartner) {
            foodPartnerData = {
                _id: foodItem.foodpartner._id || foodItem.foodpartner,
                name: foodItem.foodpartner.name || "Food Partner"
            };
        }
        
        // Create a new object with all properties explicitly defined
        const processedFoodItem = { 
            _id: foodItem._id,
            name: foodItem.name,
            description: foodItem.description,
            video: videoUrl,
            foodpartner: foodPartnerData,
            likeCount: foodItem.likeCount,
            savesCount: foodItem.savesCount,
            createdAt: foodItem.createdAt,
            updatedAt: foodItem.updatedAt
        };

        res.status(200).json({
            message: "Food item fetched successfully",
            foodItem: processedFoodItem
        });
    } catch (error) {
        console.error("Error fetching food item:", error);
        console.error("Error stack:", error.stack);
        // Handle different types of errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid food ID format"
            });
        }
        res.status(500).json({
            message: "Error fetching food item",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood,
    getFoodItemById
}