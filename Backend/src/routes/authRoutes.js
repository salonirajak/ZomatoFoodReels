const express = require('express');
const authController = require("../controllers/auth.controller");
const { authUserMiddleware, authFoodPartnerMiddleware, authEitherMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// user auth APIs
router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.get('/user/logout', authController.logoutUser);

// food partner auth APIs
router.post('/food-partner/register', authController.registerFoodPartner);
router.post('/food-partner/login', authController.loginFoodPartner);
router.get('/food-partner/logout', authController.logoutFoodPartner);

// auth status check (can be accessed by either user or food partner)
// no middleware here – we want to return a simple 200/false when not logged in
router.get('/status', authController.checkAuthStatus);

module.exports = router;