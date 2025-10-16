const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");

// In-memory storage
let inMemorySaves = [];
let useInMemory = false;

// Schema definition (without creating the model yet)
const saveSchema = new mongoose.Schema({
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
let SaveModel = null;
function getSaveModel() {
    if (!SaveModel) {
        SaveModel = mongoose.model('save', saveSchema);
    }
    return SaveModel;
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
const saveModel = {
    findOne: async function(query) {
        if (shouldUseInMemory()) {
            return inMemorySaves.find(save => 
                save.user === query.user && save.food === query.food
            );
        } else {
            return await getSaveModel().findOne(query);
        }
    },
    
    create: async function(data) {
        if (shouldUseInMemory()) {
            const save = {
                _id: uuid(),
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemorySaves.push(save);
            return save;
        } else {
            return await getSaveModel().create(data);
        }
    },
    
    deleteOne: async function(query) {
        if (shouldUseInMemory()) {
            const index = inMemorySaves.findIndex(save => 
                save.user === query.user && save.food === query.food
            );
            if (index >= 0) {
                inMemorySaves.splice(index, 1);
                return { deletedCount: 1 };
            }
            return { deletedCount: 0 };
        } else {
            return await getSaveModel().deleteOne(query);
        }
    },
    
    find: async function(query) {
        if (shouldUseInMemory()) {
            return inMemorySaves.filter(save => 
                save.user === query.user
            );
        } else {
            return await getSaveModel().find(query);
        }
    }
};

// Add populate method to mimic Mongoose behavior
saveModel.populate = async function(docs, options) {
    if (shouldUseInMemory()) {
        // Mock populate for in-memory storage
        return docs;
    } else {
        return await getSaveModel().populate(docs, options);
    }
};

// Export the model and utility functions
module.exports = saveModel;
module.exports.setUseInMemory = (value) => {
    useInMemory = value;
};
module.exports.getUseInMemory = () => useInMemory;