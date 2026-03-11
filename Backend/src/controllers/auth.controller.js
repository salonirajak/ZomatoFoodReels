const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');

async function registerUser(req,res){
    try {
        // Import models only when needed
        const userModel = require("../models/user.model");
        
        const {fullName,email,password}=req.body;

        const isUserAlreadyExists = await userModel.findOne({
            email
        })
        if(isUserAlreadyExists){
            return res.status(400).json({
                message:"User already exists"
            })
        }
        
        if (!password) {
            return res.status(400).json({
                message:"Password is required"
            })
        }
        
        const hashendPassword = await bcrypt.hash(password,10);
        
        const user = await userModel.create({
            fullName,
            email,
            password:hashendPassword
        })

        // Check if JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                message:"Server configuration error"
            });
        }

        const token = jwt.sign({
            id:user._id,
        }, process.env.JWT_SECRET)
        
        // cross-site cookie for remote front end
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })

        res.status(201).json({
            message:"User registered successfully",
            user: {
                _id: user._id,
                email:user.email,
                fullName:user.fullName
            }
        })
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({
            message:"Internal server error",
            error: error.message
        });
    }
}

async function loginUser(req,res) {
    try {
        // Import models only when needed
        const userModel = require("../models/user.model");
        
        const {email,password} = req.body;

        const user = await userModel.findOne({
            email
        })
        if(!user){
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }
        
        if (!password || !user.password) {
            return res.status(400).json({
                message:"Invalid email or password"
            })
        }
        
        const isPasswordValid=await bcrypt.compare(password,user.password);
        
        if(!isPasswordValid){
            return res.status(400).json({
                message:"Invalid email or password"
            })
        }
        
        // Check if JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                message:"Server configuration error"
            });
        }

        const token = jwt.sign({
            id:user._id,
        }, process.env.JWT_SECRET)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })

        res.status(200).json({
            message:"User logged in successfully",
            user:{
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        })
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({
            message:"Internal server error",
            error: error.message
        });
    }
}

function logoutUser(req,res){
    res.clearCookie("token");
    res.status(200).json({
        message:"user logged out successfully"
    });
}

async function registerFoodPartner(req,res){
    try {
        // Import models only when needed
        const foodPartnerModel = require("../models/foodpartner.model");
        
        const {name,email,password,phone,address,contactName} = req.body;
        const isAccountAlreadyExists = await foodPartnerModel.findOne({
            email
        })
        if(isAccountAlreadyExists){
            return res.status(400).json({
                message:"Food partner account already exists"
            })
        }
        
        if (!password) {
            return res.status(400).json({
                message:"Password is required"
            })
        }
        
        console.log('Original password:', password);
        const hashendPassword = await bcrypt.hash(password,10);
        console.log('Hashed password:', hashendPassword);
        console.log('Hashed password length:', hashendPassword.length);

        const foodpartner = await foodPartnerModel.create({
            name,
            email,
            password:hashendPassword,
            phone,
            address,
            contactName
        })
        
        console.log('Created food partner:', foodpartner);

        // Check if JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                message:"Server configuration error"
            });
        }

        const token = jwt.sign({
            id: foodpartner._id,
        }, process.env.JWT_SECRET)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })
        
        res.status(201).json({
            message:"Food partner registered successfully",
            foodpartner:{
                _id:foodpartner._id,
                email:foodpartner.email,
                name:foodpartner.name,
                address:foodpartner.address,
                contactName:foodpartner.contactName,
                phone:foodpartner.phone
            }
        })
    } catch (error) {
        console.error('Error in registerFoodPartner:', error);
        res.status(500).json({
            message:"Internal server error",
            error: error.message
        });
    }
}

async function loginFoodPartner(req,res){
    try {
        // Import models only when needed
        const foodPartnerModel = require("../models/foodpartner.model");
        
        console.log('Login request received:', req.body);
        
        const {email,password} = req.body;
        
        console.log('Email:', email);
        console.log('Password:', password);
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        
        const foodpartner = await foodPartnerModel.findOne({
            email
        })
        
        console.log('Food partner found:', foodpartner);
        
        if(!foodpartner){
            console.log('Food partner not found for email:', email);
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }
        
        if (!password || !foodpartner.password) {
            console.log('Password missing');
            return res.status(400).json({
                message:"Invalid email or password"
            })
        }
        
        const isPasswordValid = await bcrypt.compare(password,foodpartner.password);
        console.log('Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Invalid password for email:', email);
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }
        
        // Check if JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                message:"Server configuration error"
            });
        }
        
        const token = jwt.sign({
            id:foodpartner._id,
        }, process.env.JWT_SECRET)
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        res.status(200).json({
            message:"Food partner logged in successfully",
            foodpartner:{
                _id:foodpartner._id,
                email: foodpartner.email,
                name:foodpartner.name
            }
        })
    } catch (error) {
        console.error('Error in loginFoodPartner:', error);
        res.status(500).json({
            message:"Internal server error",
            error: error.message
        });
    }
}

function logoutFoodPartner(req,res){
    res.clearCookie("token");
    res.status(200).json({
        message:"Food partner logged out successfully"
    });
}

async function checkAuthStatus(req, res) {
    try {
        // Import models only when needed
        const userModel = require("../models/user.model");
        const foodPartnerModel = require("../models/foodpartner.model");
        
        // Check if user is authenticated as a user
        if (req.user) {
            return res.status(200).json({
                isAuthenticated: true,
                user: {
                    _id: req.user._id,
                    email: req.user.email,
                    fullName: req.user.fullName,
                    type: 'user'
                }
            });
        }
        
        // Check if user is authenticated as a food partner
        if (req.foodpartner) {
            return res.status(200).json({
                isAuthenticated: true,
                user: {
                    _id: req.foodpartner._id,
                    email: req.foodpartner.email,
                    name: req.foodpartner.name,
                    type: 'food-partner'
                }
            });
        }
        
        // No authentication found – return 200 so client treats this as a normal 'not logged in' state
        return res.status(200).json({
            isAuthenticated: false,
            message: "Not authenticated"
        });
    } catch (error) {
        console.error('Error in checkAuthStatus:', error);
        res.status(500).json({
            isAuthenticated: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    checkAuthStatus
}