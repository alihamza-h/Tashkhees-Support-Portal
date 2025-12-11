import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LicenseKey from '../models/LicenseKey.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @route   POST /api/auth/register
// @desc    Register a new end user (requires valid license key)
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, licenseKey } = req.body;

        // License key is required for public registration
        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                message: 'License key is required for registration'
            });
        }

        // Find and validate license key
        const license = await LicenseKey.findOne({ code: licenseKey.toUpperCase() });

        if (!license) {
            return res.status(400).json({
                success: false,
                message: 'Invalid license key. Please check your key and try again.'
            });
        }

        // Check if license is valid (not used, not expired)
        const validation = license.isValid();
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user (only USER role allowed via public registration)
        const user = await User.create({
            name,
            email,
            password,
            role: 'USER',
            licenseKey: license.code,
            registeredProduct: license.product
        });

        // Mark license as used AFTER successful user creation
        await license.markAsUsed(user._id);

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to Tashkhees.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    product: license.product
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/create-developer
// @desc    Admin creates a new developer account
// @access  Private (Admin only)
router.post('/create-developer', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create developer account
        const developer = await User.create({
            name,
            email,
            password,
            role: 'DEVELOPER'
        });

        res.status(201).json({
            success: true,
            message: `Developer "${name}" created successfully`,
            data: {
                developer: {
                    id: developer._id,
                    name: developer.name,
                    email: developer.email,
                    role: developer.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/auth/developer/:id
// @desc    Admin deletes a developer account
// @access  Private (Admin only)
router.delete('/developer/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const developer = await User.findById(req.params.id);

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer not found'
            });
        }

        if (developer.role !== 'DEVELOPER') {
            return res.status(400).json({
                success: false,
                message: 'Can only delete developer accounts'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Developer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

        // Handle password update
        if (req.body.password && req.body.currentPassword) {
            // Check current password
            const isMatch = await user.comparePassword(req.body.currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid current password'
                });
            }
            user.password = req.body.password;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
