const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");

// In-memory storage
let inMemoryLikes = [];
let useInMemory = false;

// Schema definition (without creating the model yet)
const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    }
}, {
    timestamps: true
});

// Lazy initialization of the Mongoose model
let LikeModel = null;
function getLikeModel() {
    if (!LikeModel) {
        LikeModel = mongoose.model('like', likeSchema);
    }
    return LikeModel;
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
const likeModel = {
    findOne: async function(query) {
        if (shouldUseInMemory()) {
            return inMemoryLikes.find(like => 
                like.user === query.user && like.food === query.food
            );
        } else {
            return await getLikeModel().findOne(query);
        }
    },
    
    create: async function(data) {
        if (shouldUseInMemory()) {
            const like = {
                _id: uuid(),
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryLikes.push(like);
            return like;
        } else {
            return await getLikeModel().create(data);
        }
    },
    
    deleteOne: async function(query) {
        if (shouldUseInMemory()) {
            const index = inMemoryLikes.findIndex(like => 
                like.user === query.user && like.food === query.food
            );
            if (index >= 0) {
                inMemoryLikes.splice(index, 1);
                return { deletedCount: 1 };
            }
            return { deletedCount: 0 };
        } else {
            return await getLikeModel().deleteOne(query);
        }
    }
};

// Export the model and utility functions
module.exports = likeModel;
module.exports.setUseInMemory = (value) => {
    useInMemory = value;
};
module.exports.getUseInMemory = () => useInMemory;