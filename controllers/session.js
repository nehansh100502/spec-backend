const Session = require('../models/session');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup Function
exports.Signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await Session.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Session.create({ email, password: hashedPassword });

        res.status(201).json({ message: 'User created', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login Function
exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Session.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // // Log the retrieved user for debugging
        // console.log('Retrieved user:', user);

        // Ensure both password and hashed password are defined
        if (!password || !user.password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const token = generateToken(user._id);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Logout Function
// Logout Function
exports.Logout = async (req, res) => {
    try {
      const userId = req.user._id; // assume req.user is set by a middleware
      const session = await Session.findOne({ _id: userId });
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Server error', error: err.message });
        }
  
        res.status(200).json({ message: 'Logout successful' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };