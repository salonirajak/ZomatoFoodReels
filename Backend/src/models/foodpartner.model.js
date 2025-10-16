const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");

// In-memory storage
let inMemoryFoodPartners = [];
let useInMemory = false;

// Schema definition (without creating the model yet)
const foodPartnerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    contactName:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        // No length restriction to ensure bcrypt hashes can be stored properly
    }
});

// Lazy initialization of the Mongoose model
let FoodPartnerModel = null;
function getFoodPartnerModel() {
    if (!FoodPartnerModel) {
        FoodPartnerModel = mongoose.model("foodpartner", foodPartnerSchema);
    }
    return FoodPartnerModel;
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
const foodPartnerModel = {
    findById: async function(id) {
        if (shouldUseInMemory()) {
            return inMemoryFoodPartners.find(partner => partner._id === id);
        } else {
            return await getFoodPartnerModel().findById(id);
        }
    },
    
    findOne: async function(query) {
        if (shouldUseInMemory()) {
            return inMemoryFoodPartners.find(partner => {
                for (let key in query) {
                    if (partner[key] !== query[key]) {
                        return false;
                    }
                }
                return true;
            });
        } else {
            return await getFoodPartnerModel().findOne(query);
        }
    },
    
    create: async function(data) {
        if (shouldUseInMemory()) {
            const partner = {
                _id: uuid(),
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryFoodPartners.push(partner);
            return partner;
        } else {
            return await getFoodPartnerModel().create(data);
        }
    }
};

// Export the model and utility functions
module.exports = foodPartnerModel;
module.exports.getFoodPartnerModel = getFoodPartnerModel; // Export the getter function
module.exports.setUseInMemory = (value) => {
    useInMemory = value;
};
module.exports.getUseInMemory = () => useInMemory;