const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");

// In-memory storage
let inMemoryFoodItems = [];
let useInMemory = false;

// Schema definition (without creating the model yet)
const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true,
        maxlength: 100
    },
    video:{
        type:String,
        required:true,
    },
    description: {
        type:String,
        maxlength: 500
    },
    foodpartner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"foodpartner",
        required: true
    },
    likeCount:{
        type:Number,
        default:0,
        min: 0
    },
    savesCount:{
        type:Number,
        default:0,
        min: 0
    }
}, {
    timestamps: true // Add createdAt and updatedAt fields
});

// Add indexes for better query performance
foodSchema.index({ foodpartner: 1 });
foodSchema.index({ createdAt: -1 });

// Lazy initialization of the Mongoose model
let FoodModel = null;
function getFoodModel() {
    if (!FoodModel) {
        FoodModel = mongoose.model('food', foodSchema);
    }
    return FoodModel;
}

// Function to check if we should use in-memory storage
function shouldUseInMemory() {
    // If explicitly set to use in-memory, do so
    if (useInMemory) {
        return true;
    }
    
    // If MongoDB is not connected, use in-memory
    if (mongoose.connection.readyState !== 1) {
        return true;
    }
    
    return false;
}

// Wrapper functions that can switch between MongoDB and in-memory storage
const foodModel = {
    create: async function(data) {
        if (shouldUseInMemory()) {
            // For in-memory storage, we don't need to validate ObjectId format
            const item = {
                _id: uuid(),
                ...data,
                likeCount: data.likeCount || 0,
                savesCount: data.savesCount || 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryFoodItems.push(item);
            return item;
        } else {
            return await getFoodModel().create(data);
        }
    },
    
    find: async function(query = {}, options = {}) {
        if (shouldUseInMemory()) {
            // Simple filtering logic
            let results = inMemoryFoodItems.filter(item => {
                for (let key in query) {
                    // For in-memory, we do simple equality checks
                    if (item[key] !== query[key]) {
                        return false;
                    }
                }
                return true;
            });
            
            console.log('Food model find results:', results.length, 'items');
            results.forEach((item, index) => {
                console.log(`Item ${index}:`, {
                    id: item._id,
                    name: item.name,
                    description: item.description,
                    descriptionType: typeof item.description,
                    hasDescription: !!item.description
                });
            });
            
            // Apply populate-like behavior for foodpartner
            if (options.populate) {
                results = results.map(item => ({
                    ...item,
                    foodpartner: item.foodpartner ? {
                        _id: item.foodpartner,
                        name: "Food Partner" // Mock name
                    } : null
                }));
            }
            
            return results;
        } else {
            let queryBuilder = getFoodModel().find(query);
            if (options.populate) {
                queryBuilder = queryBuilder.populate(options.populate);
            }
            return await queryBuilder;
        }
    },
    
    findById: async function(id) {
        if (shouldUseInMemory()) {
            return inMemoryFoodItems.find(item => item._id === id);
        } else {
            return await getFoodModel().findById(id);
        }
    },
    
    findByIdAndUpdate: async function(id, update) {
        if (shouldUseInMemory()) {
            const item = inMemoryFoodItems.find(item => item._id === id);
            if (item) {
                if (update.$inc) {
                    for (let key in update.$inc) {
                        item[key] = (item[key] || 0) + update.$inc[key];
                    }
                }
                item.updatedAt = new Date();
                return item;
            }
            return null;
        } else {
            return await getFoodModel().findByIdAndUpdate(id, update, { new: true });
        }
    }
};

// Add populate method to mimic Mongoose behavior
foodModel.populate = async function(docs, options) {
    if (shouldUseInMemory()) {
        // Import food partner model
        const foodPartnerModel = require('./foodpartner.model');
        
        // Mock populate for in-memory storage
        if (Array.isArray(docs)) {
            // For each document, fetch the actual food partner data
            const populatedDocs = [];
            for (const doc of docs) {
                let foodPartner = null;
                if (doc.foodpartner) {
                    // Try to find the actual food partner
                    foodPartner = await foodPartnerModel.findById(doc.foodpartner);
                    if (!foodPartner) {
                        // If not found, create mock data
                        foodPartner = {
                            _id: doc.foodpartner,
                            name: "Food Partner"
                        };
                    }
                }
                
                populatedDocs.push({
                    ...doc,
                    foodpartner: foodPartner
                });
            }
            return populatedDocs;
        } else {
            // Handle single document
            let foodPartner = null;
            if (docs.foodpartner) {
                // Try to find the actual food partner
                foodPartner = await foodPartnerModel.findById(docs.foodpartner);
                if (!foodPartner) {
                    // If not found, create mock data
                    foodPartner = {
                        _id: docs.foodpartner,
                        name: "Food Partner"
                    };
                }
            }
            
            return {
                ...docs,
                foodpartner: foodPartner
            };
        }
    } else {
        // For MongoDB, we need to use the actual populate method
        const model = getFoodModel();
        // If docs is an array, we need to create a query and populate
        if (Array.isArray(docs)) {
            // Create a query with the IDs
            const ids = docs.map(doc => doc._id);
            return await model.find({ _id: { $in: ids } }).populate(options.path);
        } else {
            // For single document
            return await model.findById(docs._id).populate(options.path);
        }
    }
};

// Export the model and utility functions
module.exports = foodModel;
module.exports.getFoodModel = getFoodModel; // Export the getter function
module.exports.setUseInMemory = (value) => {
    useInMemory = value;
};
module.exports.getUseInMemory = () => useInMemory;