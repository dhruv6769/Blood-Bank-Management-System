import express from 'express';
import { ProfileEditRequest } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// User proposes a profile edit
router.post('/request-edit', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id || req.userId; // compatibility for diff auth setups
        const { proposedData } = req.body; 

        if (!proposedData) {
            return res.status(400).json({ status: 'error', message: 'No data provided.' });
        }

        // Strictly block sensitive fields
        if ('email' in proposedData) delete proposedData.email;
        if ('password' in proposedData) delete proposedData.password;
        if ('role' in proposedData) delete proposedData.role;
        if ('points' in proposedData) delete proposedData.points;
        if ('badge' in proposedData) delete proposedData.badge;
        if ('bloodGroup' in proposedData) delete proposedData.bloodGroup; // Prevent medical fraud

        const editReq = await ProfileEditRequest.create({
            userId,
            proposedData,
            status: 'PENDING'
        });

        res.status(201).json({ status: 'success', data: editReq, message: 'Edit request submitted to admin for review.' });
    } catch (error) {
        console.error('Profile Edit Request Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to submit profile edit request.' });
    }
});

export default router;
