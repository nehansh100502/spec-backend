const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Session = require('../models/session');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require('../utils/sendEmail');

// Function to generate JWT token
const generateToken = (userId, username) => {
    return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Signup Function with Validation Middleware
exports.Signup = [
    // Validation rules
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .custom(value => /^[A-Z][a-zA-Z0-9]+$/.test(value)).withMessage('Username must start with a capital letter and contain only letters and numbers'),
    body('email')
        .isEmail().withMessage('Please enter a valid email address'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),

    // Controller logic
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, phone } = req.body;

        try {
            console.log('Signup request body:', req.body);  // Debugging

            // Check if the email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Check if the username already exists
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({ username, email, password: hashedPassword, phone });
            await newUser.save();

            // Generate a token
            const token = generateToken(newUser._id, username);

            // Save user information and token in session
            req.session.user = {
                userId: newUser._id,
                username: newUser.username,
                email: newUser.email,
                token: token,
            };

            // Send response with redirection URL
            res.status(201).json({ 
                message: 'User created and session started', 
                user: newUser, 
                token,
                redirectUrl: '/'  // Home page
            });
        } catch (error) {
            console.error('Signup error:', error);  // Debugging
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
];

// Login Function (No validation changes required)
exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login request body:', req.body);  // Debugging

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        console.log('Stored hashed password:', user.password);  // Debugging

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);  // Debugging

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password. Please try again or reset your password.' });
        }

        // Generate a token with user ID and username
        const token = generateToken(user._id, user.username);

        // Save session data
        await Session.create({ userId: user._id, username: user.username, token });

        // Respond with the token and username
        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            username: user.username, // Ensure this is included
        });
    } catch (error) {
        console.error('Login error:', error);  // Debugging
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.Logout = async (req, res) => {
    try {
        // Log the incoming request for debugging
        console.log('Logout request for user:', req.user._id);

        // Remove the token from the user's tokens array
        req.user.tokens = req.user.tokens.filter((tokenObj) => tokenObj.token !== req.token);
        await req.user.save();

        res.status(200).send({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).send({ message: 'Server error', error: error.message });
    }
};


// Forgot Password Function
exports.ForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        console.log('Forgot Password request:', req.body);  // Debugging

        // Find the user by email
        const user = await User.findOne({ email });

        // If the user is not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a password reset token
        const resetToken = generateToken(user._id, user.username);  // Adjust as needed

        // Save the reset token to the user's document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send the password reset email
        const resetUrl = `http://localhost:4000/reset-password/${resetToken}`;
        await sendEmail({
            to: email,
            subject: 'Password Reset',
            text: `Click this link to reset your password: ${resetUrl}`,
        });

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot Password error:', error);  // Debugging
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Reset Password Function
exports.ResetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        console.log('Reset Password request:', req.body);  // Debugging

        // Find the user by reset token
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        // If the user is not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'Invalid reset token' });
        }

        // Check if the passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset Password error:', error);  // Debugging
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.GetUserProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure token contains expected payload
        if (!decoded || !decoded._id) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const user = await User.findById(decoded._id).select('username email'); // Select both username and email
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ username: user.username, email: user.email }); // Include email in the response
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};
