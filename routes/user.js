const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user');  // Correct import for the User model
const { authMiddleware } = require('../middleware/auth');
const { Logout, ForgotPassword, ResetPassword } = require('../middleware/auth');
const { GetUserProfile, GetUserDetails } = require('../controllers/user');
const { DeleteUserAccount } = require('../controllers/user');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { body } = require('express-validator');
const { updateProfile } = require('../controllers/userProfile');

// POST route for signup
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password,phone } = req.body;

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword,phone });

        await user.save();

        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        console.log('Login request body:', req.body);  // Debugging

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        console.error('Login error:', error);  // Debugging
        res.status(400).json({ message: 'Login failed', error: error.message });
    }
});

router.post('/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tokenObj) => tokenObj.token !== req.token);
        await req.user.save();
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// POST route for forgot password
router.post('/forgot-password', (req, res, next) => {
    ForgotPassword(req, res, next);
});

// POST route for reset password
router.post('/reset-password/:resetToken', (req, res, next) => {
    ResetPassword(req, res, next);
});
router.get('/user/profile', authMiddleware, GetUserProfile);


router.get('/user/Details', authMiddleware, GetUserDetails);

router.get('/user/delete/:userId', DeleteUserAccount);

// API Route to update or create user profile
router.post(
    '/updateProfile',
    upload.single('profilePic'), // Handle file upload for profile picture
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('dob').isDate().withMessage('Date of birth must be a valid date'),
    ],
    updateProfile
  );
//   router.get('/getProfile/:userProfileId', async (req, res) => {
//     try {
//         const { userProfileId } = req.params;

//         // Find the user profile by ID
//         const userProfile = await User.findById(userProfileId);

//         // If user profile is found, return the name, dob, and profilePic
//         if (userProfile) {
//             const { name, dob, profilePic } = userProfile;
//             return res.status(200).send({ name, dob, profilePic });
//         } else {
//             return res.status(404).send({ message: 'User profile not found.' });
//         }
//     } catch (error) {
//         console.error('Error fetching user profile:', error);
//         return res.status(500).send({ error: 'Unable to fetch profile data. Please try again later.' });
//     }
// });






// GET /api/user/profile - Get logged-in user's username and email
// router.get('/user/profile', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user._id; // Get user ID from token payload
//         const user = await User.findById(userId).select('username email'); // Fetch username and email
        
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         res.json({ 
//             success: true,
//             username: user.username,
//             email: user.email
//         });
//     } catch (error) {
//         console.error('Error fetching user profile:', error.message);
//         res.status(500).json({ success: false, message: 'Server Error' });
//     }
// });

module.exports = router;



