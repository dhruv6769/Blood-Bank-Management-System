import express from 'express';
import { User, Request, Donation, Notification } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { BADGES } from '../utils/gamification.js';

const router = express.Router();

// Get User Profile & Dashboard Data
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        console.log('!!! DASHBOARD ROUTE HIT !!!');
        console.log('User from token:', req.user);
        const userId = req.user.id;
        
        console.log('Fetching user data for ID:', userId);
        const user = await User.findByPk(userId);
        console.log('User found:', user ? { id: user.id, name: user.name, role: user.role } : 'No user found');
        
        console.log('Fetching requests for user:', userId);
        const requests = await Request.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
        console.log('Requests found:', requests.length);
        
        console.log('Fetching donations for user:', userId);
        const donations = await Donation.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
        console.log('Donations found:', donations.length);
        
        const totalDonations = donations.length;
        const approvedDonations = donations.filter(d => d.status === 'APPROVED' || d.status === 'COMPLETED');
        const livesSaved = approvedDonations.length * 3;
        
        // Calculate next eligibility (90 days after last donation)
        let nextEligibilityDate = null;
        if (approvedDonations.length > 0) {
            try {
                const sorted = [...approvedDonations].sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });
                const lastDonation = sorted[0];
                if (lastDonation && lastDonation.createdAt) {
                    const lastDate = new Date(lastDonation.createdAt);
                    if (!isNaN(lastDate.getTime())) {
                        nextEligibilityDate = new Date(lastDate.getTime() + (90 * 24 * 60 * 60 * 1000));
                    }
                }
            } catch (e) {
                console.error('Eligibility calculation failed:', e);
            }
        }

        const points = approvedDonations.length * 50;
        
        // Dynamic badge calculation
        let dynamicBadge = 'Starter';
        const sortedBadges = Object.entries(BADGES).sort((a, b) => a[1].minPoints - b[1].minPoints);
        for (const [name, info] of sortedBadges) {
            if (points >= info.minPoints) dynamicBadge = name;
        }

        const dashboardData = {
            requests: requests.map(r => r.get({ plain: true })),
            donations: donations.map(d => d.get({ plain: true })),
            points,
            badge: dynamicBadge,
            totalDonations: totalDonations,
            pendingRequests: requests.filter(r => r.status === 'PENDING').length,
            livesSaved,
            nextEligibilityDate: (nextEligibilityDate && !isNaN(nextEligibilityDate.getTime())) ? nextEligibilityDate.toISOString() : null
        };
        
        res.json({
            status: 'success',
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get Top Donors Leaderboard (Public)
router.get('/leaderboard', async (req, res) => {
    try {
        const topDonors = await User.findAll({
            where: { role: 'DONOR' },
            attributes: ['id', 'name', 'points', 'badge', 'bloodGroup', 'city'],
            order: [['points', 'DESC']],
            limit: 10
        });
        res.json({ status: 'success', data: topDonors });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


// Submit a Blood Request
router.post('/requests', verifyToken, async (req, res) => {
    try {
        const { patientName, bloodGroup, units, hospitalName, city, contactPhone } = req.body;
        
        const newRequest = await Request.create({
            userId: req.user.id,
            patientName,
            bloodGroup,
            units,
            hospitalName,
            city,
            contactPhone,
            status: 'PENDING'
        });
        
        await Notification.create({
            userId: req.user.id,
            type: 'GENERAL',
            title: 'Blood Request Submitted 🩸',
            message: `Your emergency blood request for ${patientName} (${bloodGroup}, ${units} unit(s)) at ${hospitalName}, ${city} has been submitted. Our admin will review it shortly.`,
            read: false
        });

        res.status(201).json({ status: 'success', message: 'Blood request submitted', data: newRequest });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Submit a Blood Donation Offer (MUST be associated with a camp)
router.post('/donations', verifyToken, async (req, res) => {
    try {
        const { bloodGroup, age, condition, campId } = req.body;
        
        // Require camp selection
        if (!campId) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'You must select a donation camp. Please visit the Camps page to choose an approved camp.' 
            });
        }

        // Verify camp exists and is approved
        const { Camp } = await import('../config/db.js');
        const camp = await Camp.findByPk(campId);
        if (!camp) {
            return res.status(404).json({ status: 'error', message: 'Selected camp not found' });
        }
        if (camp.status !== 'APPROVED') {
            return res.status(400).json({ status: 'error', message: 'Selected camp is not approved yet' });
        }
        
        const newDonation = await Donation.create({
            userId: req.user.id,
            bloodGroup,
            age,
            condition,
            campId, // Now required
            status: 'PENDING' // Will be reviewed by admin
        });
        
        await Notification.create({
            userId: req.user.id,
            type: 'DONATION_APPROVED',
            title: 'Donation Offer Submitted 🙌',
            message: `Your ${bloodGroup} blood donation offer at ${camp.name} has been received and is pending admin review. You will be notified once it's approved!`,
            read: false
        });

        res.status(201).json({ 
            status: 'success', 
            message: 'Donation request submitted for admin approval. You will be notified once approved.', 
            data: newDonation 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get user's notifications
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const { Notification } = await import('../config/db.js');
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 30
        });
        const unreadCount = notifications.filter(n => !n.read).length;
        res.json({ status: 'success', data: notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Mark all notifications as read  ← MUST be before /:id/read
router.put('/notifications/read-all', verifyToken, async (req, res) => {
    try {
        const { Notification } = await import('../config/db.js');
        await Notification.update({ read: true }, { where: { userId: req.user.id, read: false } });
        res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Mark a single notification as read  ← MUST be after read-all
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        const { Notification } = await import('../config/db.js');
        await Notification.update(
            { read: true },
            { where: { id: req.params.id, userId: req.user.id } }
        );
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


// Test endpoint for debugging
router.get('/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'User API is working',
        timestamp: new Date().toISOString(),
        baseURL: req.baseUrl,
        originalUrl: req.originalUrl
    });
});

export default router;
