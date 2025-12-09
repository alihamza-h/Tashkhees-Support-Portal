import mongoose from 'mongoose';
import crypto from 'crypto';

const licenseKeySchema = new mongoose.Schema({
    // The unique license code (e.g., "TSK-XXXX-XXXX-XXXX")
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },

    // Which product this license is for
    product: {
        type: String,
        required: true,
        enum: ['RxScan', 'Medscribe', 'Legalyze', 'DICOM Viewer', 'Breast Cancer Detection', 'All Products'],
        default: 'All Products'
    },

    // Is this license already used?
    isUsed: {
        type: Boolean,
        default: false
    },

    // Who used this license (reference to User)
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // When was it used
    usedAt: {
        type: Date,
        default: null
    },

    // Optional: When does this license expire (for time-limited offers)
    expiresAt: {
        type: Date,
        default: null
    },

    // Who created this license (admin reference)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Additional notes about this license
    notes: {
        type: String,
        default: ''
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate a unique license code
licenseKeySchema.statics.generateCode = function () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];

    for (let i = 0; i < 3; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }

    return `TSK-${segments.join('-')}`;
};

// Check if license is valid (not used and not expired)
licenseKeySchema.methods.isValid = function () {
    // Already used
    if (this.isUsed) {
        return { valid: false, reason: 'This license key has already been used' };
    }

    // Expired
    if (this.expiresAt && new Date() > this.expiresAt) {
        return { valid: false, reason: 'This license key has expired' };
    }

    return { valid: true };
};

// Mark license as used
licenseKeySchema.methods.markAsUsed = async function (userId) {
    this.isUsed = true;
    this.usedBy = userId;
    this.usedAt = new Date();
    await this.save();
};

// Index for faster lookups
licenseKeySchema.index({ code: 1 });
licenseKeySchema.index({ isUsed: 1 });
licenseKeySchema.index({ product: 1 });

const LicenseKey = mongoose.model('LicenseKey', licenseKeySchema);

export default LicenseKey;
