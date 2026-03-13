const express = require('express');
const foodController = require("../controllers/food.controller")
const authMiddleware = require("../middleware/auth.middleware")
const router = express.Router();
const multer = require('multer');

// Configure multer with limits and file filter
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File size too large. Maximum file size is 50MB.'
            });
        }
        return res.status(400).json({
            message: 'File upload error: ' + err.message
        });
    } else if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    next();
};

/* POST /api/food/[protected]*/
router.post('/', 
    upload.single('video'), 
    handleMulterError,
    authMiddleware.authFoodPartnerMiddleware, 
    (req, res, next) => {
        console.log('Received request to create food');
        console.log('Request file:', req.file);
        console.log('Request body:', req.body);
        next();
    }, 
    foodController.createFood
);

/* GET /api/food/[public for testing, protected in production]*/
// For production, uncomment the line below and comment out the line after
router.get('/', foodController.getFoodItems);
// router.get('/', authMiddleware.authUserMiddleware, foodController.getFoodItems);

// Add route to get a specific food item by ID
router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood
);

router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
);

// ID route hamesha last me hona chahiye
router.get('/:id', foodController.getFoodItemById);

module.exports = router