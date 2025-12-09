import express from 'express';
import LicenseKey from '../models/LicenseKey.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/licenses/generate
// @desc    Generate new license keys
// @access  Private (Admin only)
router.post('/generate', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { count = 1, product = 'All Products', expiresAt = null, notes = '' } = req.body;

        const generatedKeys = [];

        for (let i = 0; i < Math.min(count, 50); i++) { // Max 50 at a time
            let code;
            let exists = true;

            // Generate unique code
            while (exists) {
                code = LicenseKey.generateCode();
                exists = await LicenseKey.findOne({ code });
            }

            const license = await LicenseKey.create({
                code,
                product,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                notes,
                createdBy: req.user._id
            });

            generatedKeys.push({
                code: license.code,
                product: license.product,
                createdAt: license.createdAt
            });
        }

        res.status(201).json({
            success: true,
            message: `${generatedKeys.length} license key(s) generated successfully`,
            data: { licenses: generatedKeys }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/licenses
// @desc    Get all license keys
// @access  Private (Admin only)
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { used, product } = req.query;

        let query = {};
        if (used === 'true') query.isUsed = true;
        if (used === 'false') query.isUsed = false;
        if (product) query.product = product;

        const licenses = await LicenseKey.find(query)
            .populate('usedBy', 'name email')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        const stats = {
            total: await LicenseKey.countDocuments(),
            used: await LicenseKey.countDocuments({ isUsed: true }),
            available: await LicenseKey.countDocuments({ isUsed: false })
        };

        res.status(200).json({
            success: true,
            data: { licenses, stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/licenses/validate
// @desc    Validate a license key (public - for registration check)
// @access  Public
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'License code is required'
            });
        }

        const license = await LicenseKey.findOne({ code: code.toUpperCase() });

        if (!license) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: 'License key not found'
            });
        }

        const validation = license.isValid();

        res.status(200).json({
            success: true,
            valid: validation.valid,
            message: validation.valid ? 'License key is valid' : validation.reason,
            data: validation.valid ? {
                product: license.product
            } : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/licenses/:id
// @desc    Delete a license key (only if unused)
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const license = await LicenseKey.findById(req.params.id);

        if (!license) {
            return res.status(404).json({
                success: false,
                message: 'License key not found'
            });
        }

        if (license.isUsed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a used license key'
            });
        }

        await LicenseKey.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'License key deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
