import express from 'express';
import { User, Request, Donation, Camp, Notification, ProfileEditRequest, SupportMessage, sequelize } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import { clearCache } from '../middleware/cache.js';
import { recalculateUserGamification } from '../utils/gamification.js';
import { Op } from 'sequelize';

const router = express.Router();

// ─── Dashboard Overview ───────────────────────────────────────────────────────
router.get('/dashboard', verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count({ where: { role: 'DONOR' } });
        const totalOrgs = await User.count({ where: { role: 'ORGANIZATION' } });
        const pendingRequests = await Request.count({ where: { status: 'PENDING' } });
        const pendingDonations = await Donation.count({ where: { status: 'PENDING' } });
        const pendingCamps = await Camp.count({ where: { status: 'PENDING' } });
        const approvedCamps = await Camp.count({ where: { status: 'APPROVED' } });
        const pendingProfileEdits = await ProfileEditRequest.count({ where: { status: 'PENDING' } });
        const pendingSupport = await SupportMessage.count({ where: { isReadByAdmin: false } });

        const stock = {
            'A+': 12, 'A-': 5, 'B+': 18, 'B-': 3,
            'O+': 25, 'O-': 8, 'AB+': 7, 'AB-': 2
        };

        res.json({
            status: 'success',
            data: { totalUsers, totalOrgs, pendingRequests, pendingDonations, pendingCamps, approvedCamps, pendingProfileEdits, pendingSupport, stock }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Blood Requests ───────────────────────────────────────────────────────────
router.get('/requests/pending', verifyAdmin, async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { status: 'PENDING' },
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        });
        res.json({ status: 'success', data: requests });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/requests/:id', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findByPk(req.params.id);
        if (!request) return res.status(404).json({ status: 'error', message: 'Request not found' });

        await request.update({ status });

        // Notify the user about the status change
        if (status === 'APPROVED' || status === 'REJECTED') {
            await Notification.create({
                userId: request.userId,
                type: 'GENERAL',
                title: `Blood Request ${status === 'APPROVED' ? 'Approved ✅' : 'Rejected ❌'}`,
                message: status === 'APPROVED'
                    ? `Great news! Your emergency blood request for ${request.patientName} (${request.bloodGroup}) has been approved. Our team is coordinating donors. 🩸`
                    : `Your blood request for ${request.patientName} was reviewed and could not be fulfilled at this time. Please submit a new request if needed.`,
                read: false
            });
        }

        res.json({ status: 'success', message: `Request ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Donation Offers ──────────────────────────────────────────────────────────
// BADGES logic moved to gamification.js
router.get('/donations/pending', verifyAdmin, async (req, res) => {
    try {
        const donations = await Donation.findAll({
            where: { status: 'PENDING' },
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'bloodGroup', 'age'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', data: donations });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/donations/:id', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid status' });
        }
        
        const donation = await Donation.findByPk(req.params.id);
        if (!donation) return res.status(404).json({ status: 'error', message: 'Donation not found' });

        const previousStatus = donation.status;
        await donation.update({ status });

        // Award points and update badge when donation is approved or completed (but not both)
        if ((status === 'APPROVED' || status === 'COMPLETED') && previousStatus === 'PENDING') {
            const user = await User.findByPk(donation.userId);
            if (user) {
                // Use the perfect recalculation engine
                const result = await recalculateUserGamification(user.id);
                
                if (status === 'COMPLETED') {
                    await user.update({ lastDonationDate: new Date() });
                }
                
                // Clear leaderboard cache so Heroes board updates instantly
                clearCache('/api/leaderboard');

                // Create notification for the user
                await Notification.create({
                    userId: user.id,
                    type: 'DONATION_APPROVED',
                    title: `Donation ${status === 'APPROVED' ? 'Approved' : 'Completed'}!`,
                    message: `Your blood donation has been ${status.toLowerCase()}! You now have ${result.points} points and your badge is ${result.badge} (${result.totalDonations} donations). Thank you for saving lives! 🩸❤️`,
                    read: false
                });
            }
        }
        
        // Prevent double-awarding: If going from APPROVED to COMPLETED, don't award points again
        else if (status === 'COMPLETED' && previousStatus === 'APPROVED') {
            const user = await User.findByPk(donation.userId);
            if (user) {
                // Just update the last donation date, no additional points
                await user.update({ lastDonationDate: new Date() });
                
                // Create notification for completion
                await Notification.create({
                    userId: user.id,
                    type: 'DONATION_APPROVED',
                    title: 'Donation Completed!',
                    message: `Your blood donation has been completed! Thank you for saving lives! 🩸❤️`,
                    read: false
                });
            }
        }

        res.json({ status: 'success', message: `Donation ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Donation Camps (NEW) ─────────────────────────────────────────────────────

// Get all pending camp requests from organizations
router.get('/camps/pending', verifyAdmin, async (req, res) => {
    try {
        const camps = await Camp.findAll({
            where: { status: 'PENDING' },
            include: [{ model: User, as: 'organization', attributes: ['name', 'email', 'orgName', 'orgPhone'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', camps });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get ALL camps (any status) for admin
router.get('/camps', verifyAdmin, async (req, res) => {
    try {
        const camps = await Camp.findAll({
            include: [{ model: User, as: 'organization', attributes: ['name', 'orgName'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', camps });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Approve or Reject a Camp
router.put('/camps/:id', verifyAdmin, async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid status. Use APPROVED or REJECTED.' });
        }
        await Camp.update({ status, adminNote }, { where: { id: req.params.id } });
        res.json({ status: 'success', message: `Camp ${status.toLowerCase()} successfully.` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Profile Edit Requests (NEW) ──────────────────────────────────────────────
router.get('/profile-edits', verifyAdmin, async (req, res) => {
    try {
        const requests = await ProfileEditRequest.findAll({
            where: { status: 'PENDING' },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar', 'phone', 'city', 'state'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', data: requests });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/profile-edits/:id', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid status' });
        }

        const editReq = await ProfileEditRequest.findByPk(req.params.id);
        if (!editReq) return res.status(404).json({ status: 'error', message: 'Request not found' });

        if (status === 'APPROVED') {
            const user = await User.findByPk(editReq.userId);
            if (user) {
                // Apply changes
                let parsedData = editReq.proposedData;
                if (typeof parsedData === 'string') {
                    try { parsedData = JSON.parse(parsedData); } catch(e) { console.error('Parse err:', e); }
                }
                await user.update(parsedData);
                
                await Notification.create({
                    userId: user.id,
                    type: 'GENERAL',
                    title: 'Profile Update Approved',
                    message: 'Your profile edit request has been approved and securely applied to your Sanctuary record.',
                });
            }
        } else if (status === 'REJECTED') {
            await Notification.create({
                userId: editReq.userId,
                type: 'GENERAL',
                title: 'Profile Update Rejected',
                message: 'Your profile edit request was reviewed and rejected by the administrators.',
            });
        }

        await editReq.update({ status });
        
        res.json({ status: 'success', message: `Profile edit ${status.toLowerCase()} successfully.` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Users / Donors ───────────────────────────────────────────────────────────
router.get('/donors', verifyAdmin, async (req, res) => {
    try {
        const donors = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json({ status: 'success', data: donors });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Get all DONOR users ──────────────────────────────────────────────────────
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: 'DONOR' },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Admin fetching users: Found ${users.length} DONOR users`);
        console.log('Users:', users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
        res.json({ status: 'success', users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Debug endpoint to get all users (any role) ──────────────────────────────
router.get('/users/all', verifyAdmin, async (req, res) => {
    try {
        const allUsers = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Debug: Found ${allUsers.length} total users`);
        console.log('All users:', allUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
        res.json({ status: 'success', users: allUsers });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Get all ORGANIZATION users ────────────────────────────────────────────────
router.get('/organizations', verifyAdmin, async (req, res) => {
    try {
        const orgs = await User.findAll({
            where: { role: 'ORGANIZATION' },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', orgs });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Delete / Remove a user or org ───────────────────────────────────────────
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        if (user.role === 'ADMIN') return res.status(403).json({ status: 'error', message: 'Cannot delete an admin account.' });

        // Delete their camps too if org
        if (user.role === 'ORGANIZATION') {
            await Camp.destroy({ where: { organizationId: user.id } });
        }
        await user.destroy();
        res.json({ status: 'success', message: 'User removed successfully.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
