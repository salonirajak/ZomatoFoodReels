const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Export a flag to indicate if we're using in-memory storage
let useInMemory = false;

// Function to add initial test data when using in-memory storage
async function addInitialTestData() {
    try {
        // Import models only when needed
        const foodModel = require('../models/food.model');
        
        // Only add data if using in-memory storage and no data exists
        if (!useInMemory) return;
        
        const existingItems = await foodModel.find({});
        console.log('Checking existing items in in-memory storage:', existingItems.length);
        if (existingItems.length > 0) {
            console.log('In-memory storage already has data, not adding more');
            return;
        }
        
        // Check if mock data already exists (import mock-db to initialize it)
        const mockDb = require('./mock-db');
        const mockItems = mockDb.inMemoryFoodItems;
        console.log('Mock items available:', mockItems ? mockItems.length : 0);
        
        // If we have mock items, don't add test data
        if (mockItems && mockItems.length > 0) {
            console.log('Using existing mock data instead of creating new test data');
            return;
        }
        
        console.log('Adding initial test data to in-memory storage...');
        
        // Check what video files are available
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        let videoFiles = [];
        if (fs.existsSync(uploadsDir)) {
            videoFiles = fs.readdirSync(uploadsDir).filter(file => 
                file.endsWith('.mp4') && fs.statSync(path.join(uploadsDir, file)).size > 0
            );
        }
        
        // If no valid video files, use a placeholder
        if (videoFiles.length === 0) {
            videoFiles = ['placeholder.mp4'];
        }
        
        // Create test food items
        const testItems = [
            {
                name: 'Delicious Pasta',
                description: 'Freshly made pasta with homemade sauce',
                video: `/uploads/${videoFiles[0]}`,
                foodpartner: 'partner-1',
                likeCount: 15,
                savesCount: 8
            },
            {
                name: 'Gourmet Burger',
                description: 'Juicy burger with special ingredients',
                video: `/uploads/${videoFiles[1] || videoFiles[0]}`,
                foodpartner: 'partner-2',
                likeCount: 24,
                savesCount: 12
            },
            {
                name: 'Fresh Salad',
                description: 'Healthy salad with organic vegetables',
                video: `/uploads/${videoFiles[2] || videoFiles[0]}`,
                foodpartner: 'partner-3',
                likeCount: 9,
                savesCount: 5
            }
        ];
        
        // Add items to in-memory storage
        for (let i = 0; i < testItems.length; i++) {
            await foodModel.create(testItems[i]);
        }
        
        console.log('Initial test data added successfully');
    } catch (error) {
        console.error('Error adding initial test data:', error.message);
    }
}

function connectDB(){
    // Use MongoDB Atlas as default (free tier) with local fallback
    // If you have a local MongoDB, it will use that; otherwise, it will show instructions for MongoDB Atlas
    const localMongoUrl = 'mongodb://localhost:27017/zomato';
    
    // Try to determine which URL to use based on environment variables
    let mongoUrl = process.env.MONGODB_URL || localMongoUrl;
    
    console.log('Attempting to connect to MongoDB at:', mongoUrl);
    
    // Connection options with faster timeout
    const options = {
        serverSelectionTimeoutMS: 3000, // Timeout after 3s instead of default 30s
        socketTimeoutMS: 10000, // Close sockets after 10 seconds of inactivity
        maxPoolSize: 5, // Maintain up to 5 socket connections
    };
    
    // Try to connect to MongoDB with a timeout
    const connectPromise = mongoose.connect(mongoUrl, options);
    
    // Set a timeout for the connection
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('MongoDB connection timeout'));
        }, 3000);
    });
    
    // Race the connection with the timeout
    Promise.race([connectPromise, timeoutPromise])
    .then(()=>{
        console.log("MongoDB connected successfully");
        useInMemory = false;
        
        // Import all models first
        const foodModel = require('../models/food.model');
        const likeModel = require('../models/likes.model');
        const saveModel = require('../models/save.model');
        const userModel = require('../models/user.model');
        const foodPartnerModel = require('../models/foodpartner.model');
        
        // Explicitly initialize all Mongoose models to ensure schemas are registered
        // This must be done in the correct order to handle dependencies
        try {
            // Initialize food partner model first (since food model references it)
            console.log('Initializing food partner model...');
            const FoodPartnerModel = foodPartnerModel.getFoodPartnerModel();
            console.log('Food partner model initialized:', FoodPartnerModel.modelName);
            
            // Then initialize food model
            console.log('Initializing food model...');
            const FoodModel = foodModel.getFoodModel();
            console.log('Food model initialized:', FoodModel.modelName);
            
            console.log('All models initialized successfully');
        } catch (initError) {
            console.error('Error initializing models:', initError);
        }
        
        // Set in-memory flag on all models
        if (foodModel.setUseInMemory) foodModel.setUseInMemory(false);
        if (likeModel.setUseInMemory) likeModel.setUseInMemory(false);
        if (saveModel.setUseInMemory) saveModel.setUseInMemory(false);
        if (userModel.setUseInMemory) userModel.setUseInMemory(false);
        if (foodPartnerModel.setUseInMemory) foodPartnerModel.setUseInMemory(false);
    })
    .catch(async (err)=>{
        console.error("MongoDB connection error:", err.message);
        console.log("Switching to in-memory storage for development...");
        useInMemory = true;
        
        // Import models only after connection attempt
        const foodModel = require('../models/food.model');
        const likeModel = require('../models/likes.model');
        const saveModel = require('../models/save.model');
        const userModel = require('../models/user.model');
        const foodPartnerModel = require('../models/foodpartner.model');
        
        // Import mock-db to initialize mock data
        console.log('Importing mock-db to initialize mock data...');
        const mockDb = require('./mock-db');
        console.log('Mock data initialized. Food items:', mockDb.inMemoryFoodItems ? mockDb.inMemoryFoodItems.length : 0);
        
        // Set in-memory flag on all models
        console.log('Setting useInMemory flag to true on all models');
        if (foodModel.setUseInMemory) {
            foodModel.setUseInMemory(true);
            console.log('Set useInMemory on foodModel');
        }
        if (likeModel.setUseInMemory) {
            likeModel.setUseInMemory(true);
            console.log('Set useInMemory on likeModel');
        }
        if (saveModel.setUseInMemory) {
            saveModel.setUseInMemory(true);
            console.log('Set useInMemory on saveModel');
        }
        if (userModel.setUseInMemory) {
            userModel.setUseInMemory(true);
            console.log('Set useInMemory on userModel');
        }
        if (foodPartnerModel.setUseInMemory) {
            foodPartnerModel.setUseInMemory(true);
            console.log('Set useInMemory on foodPartnerModel');
        }
        
        // Add initial test data
        console.log('Calling addInitialTestData...');
        await addInitialTestData();
        console.log('Finished calling addInitialTestData');
        
        // If using local MongoDB, provide specific instructions
        if (mongoUrl === localMongoUrl) {
            console.error("\n=== MongoDB Connection Help ===");
            console.error("Local MongoDB connection failed. You have two options:");
            console.error("1. Install MongoDB locally:");
            console.error("   - Download from: https://www.mongodb.com/try/download/community");
            console.error("   - Install and start the MongoDB service");
            console.error("2. Use MongoDB Atlas (Cloud) - Easier:");
            console.error("   - Visit: https://www.mongodb.com/cloud/atlas");
            console.error("   - Create a free account and cluster");
            console.error("   - Get your connection string and add it to your .env file:");
            console.error("     MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/zomato");
            console.error("===============================\n");
        } else {
            console.error("Please check if your MongoDB Atlas connection string is correct");
            console.error("and if your IP address is whitelisted in the MongoDB Atlas dashboard");
        }
    });
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected from MongoDB');
    });
    
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('Mongoose connection closed due to app termination');
        process.exit(0);
    });
}

// Export the useInMemory flag through a getter
module.exports = connectDB;
module.exports.getUseInMemory = () => useInMemory;