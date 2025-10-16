const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");

// In-memory storage
let inMemoryUsers = [];
let useInMemory = false;

// Schema definition (without creating the model yet)
const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
    }
},
    {
        timestamps:true
    }

);

// Lazy initialization of the Mongoose model
let UserModel = null;
function getUserModel() {
    if (!UserModel) {
        UserModel = mongoose.model("user", userSchema);
    }
    return UserModel;
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
const userModel = {
    findById: async function(id) {
        if (shouldUseInMemory()) {
            return inMemoryUsers.find(user => user._id === id);
        } else {
            return await getUserModel().findById(id);
        }
    },
    
    findOne: async function(query) {
        if (shouldUseInMemory()) {
            return inMemoryUsers.find(user => {
                for (let key in query) {
                    if (user[key] !== query[key]) {
                        return false;
                    }
                }
                return true;
            });
        } else {
            return await getUserModel().findOne(query);
        }
    },
    
    create: async function(data) {
        if (shouldUseInMemory()) {
            const user = {
                _id: uuid(),
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryUsers.push(user);
            return user;
        } else {
            return await getUserModel().create(data);
        }
    }
};

// Export the model and utility functions
module.exports = userModel;
module.exports.setUseInMemory = (value) => {
    useInMemory = value;
};
module.exports.getUseInMemory = () => useInMemory;