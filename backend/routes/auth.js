const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { name, email, password } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with that email' });
            }

            const user = await User.create({ name, email, password });
            const token = generateToken(user._id);

            res.cookie('token', token, cookieOptions);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token,
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { email, password } = req.body;
            const user = await User.findOne({ email }).select('+password');

            if (!user || !(await user.matchPassword(password))) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = generateToken(user._id);

            res.cookie('token', token, cookieOptions);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token,
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
