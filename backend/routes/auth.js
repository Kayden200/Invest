const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate unique referral code
function generateReferralCode(length = 6) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, referredBy } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = generateReferralCode();

        const user = new User({
            name,
            email,
            password: hashedPassword,
            referralCode,
            referredBy: referredBy || null,
        });

        await user.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                balance: user.balance,
                isAdmin: user.isAdmin,
                referralCode: user.referralCode,
                referredBy: user.referredBy,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
