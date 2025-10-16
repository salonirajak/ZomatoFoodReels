// Mock database module for in-memory storage
const { v4: uuid } = require("uuid");

// In-memory storage
let inMemoryFoodItems = [];
let inMemoryLikes = [];
let inMemorySaves = [];
let inMemoryUsers = [];
let inMemoryFoodPartners = [];

// Add some mock users
inMemoryUsers = [
    {
        _id: 'mock-user-id',
        fullName: 'Mock User',
        email: 'user@example.com',
        password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO' // bcrypt hash for "password123"
    }
];

// Add some mock food partners
inMemoryFoodPartners = [
    {
        _id: 'partner-1',
        name: 'Italian Bistro',
        email: 'italian@example.com'
    },
    {
        _id: 'partner-2',
        name: 'Burger Palace',
        email: 'burger@example.com'
    },
    {
        _id: 'partner-3',
        name: 'Healthy Eats',
        email: 'healthy@example.com'
    }
];

// Add some mock food items with proper descriptions
inMemoryFoodItems = [
    {
        _id: 'food-1',
        name: 'Delicious Pasta',
        description: 'Freshly made pasta with homemade tomato sauce and basil. A perfect blend of Italian flavors that will make your taste buds dance with joy.',
        video: '/uploads/pasta.mp4',
        foodpartner: 'partner-1',
        likeCount: 15,
        savesCount: 8,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: 'food-2',
        name: 'Gourmet Burger',
        description: 'Juicy beef patty with special ingredients including caramelized onions, fresh lettuce, and our secret sauce. Served with crispy fries.',
        video: '/uploads/burger.mp4',
        foodpartner: 'partner-2',
        likeCount: 24,
        savesCount: 12,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: 'food-3',
        name: 'Fresh Garden Salad',
        description: 'Healthy salad with organic vegetables, cherry tomatoes, cucumber, and carrots. Topped with our homemade vinaigrette dressing.',
        video: '/uploads/salad.mp4',
        foodpartner: 'partner-3',
        likeCount: 9,
        savesCount: 5,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Mock models
const foodModel = {
    create: async (data) => {
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
    },
    find: async (query = {}) => {
        return inMemoryFoodItems.filter(item => {
            // Simple filtering logic
            for (let key in query) {
                if (item[key] !== query[key]) {
                    return false;
                }
            }
            return true;
        });
    },
    findById: async (id) => {
        return inMemoryFoodItems.find(item => item._id === id);
    },
    findByIdAndUpdate: async (id, update) => {
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
    }
};

const likeModel = {
    findOne: async (query) => {
        return inMemoryLikes.find(like => 
            like.user === query.user && like.food === query.food
        );
    },
    create: async (data) => {
        const like = {
            _id: uuid(),
            ...data,
            createdAt: new Date()
        };
        inMemoryLikes.push(like);
        return like;
    },
    deleteOne: async (query) => {
        const index = inMemoryLikes.findIndex(like => 
            like.user === query.user && like.food === query.food
        );
        if (index >= 0) {
            inMemoryLikes.splice(index, 1);
            return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
    }
};

const saveModel = {
    findOne: async (query) => {
        return inMemorySaves.find(save => 
            save.user === query.user && save.food === query.food
        );
    },
    create: async (data) => {
        const save = {
            _id: uuid(),
            ...data,
            createdAt: new Date()
        };
        inMemorySaves.push(save);
        return save;
    },
    deleteOne: async (query) => {
        const index = inMemorySaves.findIndex(save => 
            save.user === query.user && save.food === query.food
        );
        if (index >= 0) {
            inMemorySaves.splice(index, 1);
            return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
    },
    find: async (query) => {
        return inMemorySaves.filter(save => 
            save.user === query.user
        );
    }
};

const userModel = {
    findById: async (id) => {
        return inMemoryUsers.find(user => user._id === id);
    }
};

const foodPartnerModel = {
    findById: async (id) => {
        return inMemoryFoodPartners.find(partner => partner._id === id);
    }
};

module.exports = {
    foodModel,
    likeModel,
    saveModel,
    userModel,
    foodPartnerModel,
    inMemoryFoodItems,
    inMemoryLikes,
    inMemorySaves,
    inMemoryUsers,
    inMemoryFoodPartners
};