const jwt = require("jsonwebtoken");

// Mock data for in-memory storage
const mockFoodPartners = [
    {
        _id: "mock-foodpartner-id",
        name: "Mock Food Partner",
        email: "foodpartner@example.com",
        password: "$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO" // bcrypt hash for "password123"
    }
];

const mockUsers = [
    {
        _id: "mock-user-id",
        fullName: "Mock User",
        email: "user@example.com",
        password: "$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO" // bcrypt hash for "password123"
    }
];

// Middleware that checks for either user or food partner authentication
async function authEitherMiddleware(req, res, next) {
    try {
        // Import models only when needed
        const userModel = require("../models/user.model");
        const foodPartnerModel = require("../models/foodpartner.model");
        
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Please login first"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // First try to find as user
        const user = await userModel.findById(decoded.id);
        if (user) {
            req.user = user;
            req.authType = 'user';
            return next();
        }
        
        // If not user, try to find as food partner
        const foodpartner = await foodPartnerModel.findById(decoded.id);
        if (foodpartner) {
            req.foodpartner = foodpartner;
            req.authType = 'food-partner';
            return next();
        }
        
        // For in-memory storage, check mock data
        const mockUser = mockUsers.find(u => u._id === decoded.id);
        if (mockUser) {
            req.user = mockUser;
            req.authType = 'user';
            return next();
        }
        
        const mockPartner = mockFoodPartners.find(p => p._id === decoded.id);
        if (mockPartner) {
            req.foodpartner = mockPartner;
            req.authType = 'food-partner';
            return next();
        }
        
        return res.status(401).json({
            message: "Invalid credentials"
        });
    } catch (err) {
        console.error("Auth middleware error:", err);
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token format"
            });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token has expired. Please login again."
            });
        }
        return res.status(401).json({
            message: "Authentication failed. Please login again."
        });
    }
}

async function authFoodPartnerMiddleware(req, res, next) {
    try {
        // Import models only when needed
        const foodPartnerModel = require("../models/foodpartner.model");
        
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Please login as a food partner first"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Use the model (either MongoDB or in-memory)
        const foodpartner = await foodPartnerModel.findById(decoded.id);
        
        if (!foodpartner) {
            // For in-memory storage, check mock data
            const mockPartner = mockFoodPartners.find(p => p._id === decoded.id);
            if (mockPartner) {
                req.foodpartner = mockPartner;
                return next();
            }
            
            return res.status(401).json({
                message: "Invalid food partner credentials"
            });
        }
        
        req.foodpartner = foodpartner;
        next();
    } catch (err) {
        console.error("Food partner auth middleware error:", err);
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token format"
            });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token has expired. Please login again."
            });
        }
        return res.status(401).json({
            message: "Authentication failed. Please login again."
        });
    }
}

async function authUserMiddleware(req, res, next) {
    try {
        // Import models only when needed
        const userModel = require("../models/user.model");
        
        console.log('=== AUTH USER MIDDLEWARE ===');
        console.log('Cookies:', req.cookies);
        console.log('Headers:', req.headers);
        
        const token = req.cookies.token;
        if (!token) {
            console.log('ERROR: No token found in cookies');
            return res.status(401).json({
                message: "Please login first"
            });
        }
        
        console.log('Token found:', token);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        // Use the model (either MongoDB or in-memory)
        const user = await userModel.findById(decoded.id);
        console.log('User found in database:', user);
        
        if (!user) {
            // For in-memory storage, check mock data
            const mockUser = mockUsers.find(u => u._id === decoded.id);
            console.log('Mock user found:', mockUser);
            
            if (mockUser) {
                req.user = mockUser;
                console.log('Using mock user');
                return next();
            }
            
            console.log('ERROR: Invalid user credentials');
            return res.status(401).json({
                message: "Invalid user credentials"
            });
        }
        
        req.user = user;
        console.log('User authenticated successfully:', user._id);
        next();
    } catch (err) {
        console.error("User auth middleware error:", err);
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token format"
            });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token has expired. Please login again."
            });
        }
        return res.status(401).json({
            message: "Authentication failed. Please login again."
        });
    }
}

module.exports = {
    authEitherMiddleware,
    authFoodPartnerMiddleware,
    authUserMiddleware
};