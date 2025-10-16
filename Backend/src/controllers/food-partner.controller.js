const mongoose = require('mongoose');

async function getFoodPartnerById(req, res) {
    try {
        // Import models only when needed
        const foodPartnerModel = require('../models/foodpartner.model');
        const foodModel = require('../models/food.model');
        
        const foodPartnerId = req.params.id;

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(foodPartnerId)) {
            return res.status(400).json({ message: "Invalid food partner ID" });
        }

        const foodpartner = await foodPartnerModel.findById(foodPartnerId);
        const foodItemsByFoodPartner = await foodModel.find({ foodpartner: foodPartnerId });

        if (!foodpartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        res.status(200).json({
            message: "Food partner retrieved successfully",
            foodpartner: {
                ...foodpartner.toObject(),
                foodItems: foodItemsByFoodPartner
            }
        });
    } catch (error) {
        console.error("Error retrieving food partner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getFoodPartnerById
};