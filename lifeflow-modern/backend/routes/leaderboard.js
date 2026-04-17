import express from 'express';
import { User, Donation, sequelize } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { Op } from 'sequelize';
import { BADGES } from '../utils/gamification.js';

const router = express.Router();

// BADGES logic moved to gamification.js

// Achievement system
const ACHIEVEMENTS = {
    'first_donation': { name: 'First Drop', description: 'Made your first donation', emoji: '🩸' },
    'streak_3': { name: 'Consistent Hero', description: '3 donations in a row', emoji: '🔥' },
    'streak_5': { name: 'Super Donor', description: '5 donations in a row', emoji: '⭐' },
    'lifesaver_10': { name: 'Lifesaver', description: 'Saved 30 lives (10 donations)', emoji: '💝' },
    'rare_donor': { name: 'Rare Hero', description: 'Donated rare blood type', emoji: '💎' },
    'emergency_hero': { name: 'Emergency Hero', description: 'Responded to emergency', emoji: '🚨' }
};

// Get enhanced leaderboard
router.get('/top-donors', async (req, res) => {
    try {
        const { timeframe = 'all', limit = 20 } = req.query;
        
        const topDonors = await User.findAll({
            where: { role: 'DONOR' },
            attributes: [
                'id', 'name', 'badge', 'bloodGroup', 'city', 'createdAt',
                [sequelize.literal('(SELECT COUNT(*) FROM Donations WHERE Donations.userId = User.id AND (Donations.status = "COMPLETED" OR Donations.status = "APPROVED"))'), 'totalDonations'],
                [sequelize.literal('(SELECT COUNT(*) FROM Donations WHERE Donations.userId = User.id AND (Donations.status = "COMPLETED" OR Donations.status = "APPROVED")) * 1'), 'livesSaved'],
                [sequelize.literal('(SELECT COUNT(*) FROM Donations WHERE Donations.userId = User.id AND (Donations.status = "COMPLETED" OR Donations.status = "APPROVED")) * 50'), 'points']
            ],
            order: [[sequelize.literal('points'), 'DESC']],
            limit: parseInt(limit)
        });

        // Add rank and badge info
        const enhancedLeaderboard = topDonors.map((user, index) => {
            const userData = user.toJSON();
            const points = userData.points || 0;
            
            // Recalculate badge dynamically to ensure accuracy
            let effectiveBadge = 'Starter';
            const badgeEntries = Object.entries(BADGES).sort((a, b) => a[1].minPoints - b[1].minPoints);
            for (const [name, info] of badgeEntries) {
                if (points >= info.minPoints) effectiveBadge = name;
            }

            return {
                rank: index + 1,
                ...userData,
                badge: effectiveBadge,
                badgeInfo: BADGES[effectiveBadge],
                donationStreak: Math.min(userData.totalDonations, 10)
            };
        });

        res.json({ 
            status: 'success', 
            data: enhancedLeaderboard,
            meta: {
                timeframe,
                totalUsers: enhancedLeaderboard.length,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get current user achievements
router.get('/achievements', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId, {
            include: [{
                model: Donation,
                as: 'donations',
                where: { status: { [Op.in]: ['COMPLETED', 'APPROVED'] } },
                required: false
            }]
        });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const donations = user.donations || [];
        const totalDonations = donations.length;
        const livesSaved = totalDonations * 1;

        // Calculate unlocked achievements
        const unlockedAchievements = [];
        
        if (totalDonations >= 1) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.first_donation, 
                unlockedAt: donations[0].createdAt 
            });
        }
        
        if (totalDonations >= 3) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.streak_3, 
                unlockedAt: donations[2].createdAt 
            });
        }
        
        if (totalDonations >= 5) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.streak_5, 
                unlockedAt: donations[4].createdAt 
            });
        }
        
        if (totalDonations >= 10) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.lifesaver_10, 
                unlockedAt: donations[9].createdAt 
            });
        }

        // Rare blood type achievement
        if (['O-', 'AB-', 'B-', 'A-'].includes(user.bloodGroup)) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.rare_donor, 
                unlockedAt: donations[0]?.createdAt || user.createdAt 
            });
        }

        // Calculate next badge progress
        const calculatedPoints = totalDonations * 50;
        
        // Recalculate current badge dynamically
        let currentBadge = 'Starter';
        const badgeEntries = Object.entries(BADGES).sort((a, b) => a[1].minPoints - b[1].minPoints);
        for (const [name, info] of badgeEntries) {
            if (calculatedPoints >= info.minPoints) currentBadge = name;
        }

        const currentIndex = badgeEntries.findIndex(([name]) => name === currentBadge);
        const nextBadge = badgeEntries[currentIndex + 1];
        
        const progress = nextBadge ? {
            nextBadge: nextBadge[0],
            pointsNeeded: Math.max(0, nextBadge[1].minPoints - calculatedPoints),
            progressPercent: Math.min(100, Math.round((calculatedPoints / nextBadge[1].minPoints) * 100))
        } : { nextBadge: null, pointsNeeded: 0, progressPercent: 100 };

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    points: calculatedPoints,
                    badge: currentBadge,
                    badgeInfo: BADGES[currentBadge],
                    totalDonations,
                    livesSaved,
                    bloodGroup: user.bloodGroup,
                    city: user.city
                },
                achievements: {
                    unlocked: unlockedAchievements,
                    available: Object.values(ACHIEVEMENTS),
                    totalUnlocked: unlockedAchievements.length,
                    totalAvailable: Object.keys(ACHIEVEMENTS).length
                },
                progress,
                stats: {
                    rank: await getUserRank(userId),
                    percentile: await getUserPercentile(userId)
                }
            }
        });
    } catch (error) {
        console.error('Achievements error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get user achievements by ID
router.get('/achievements/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const user = await User.findByPk(userId, {
            include: [{
                model: Donation,
                as: 'donations',
                where: { status: { [Op.in]: ['COMPLETED', 'APPROVED'] } },
                required: false
            }]
        });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const donations = user.donations || [];
        const totalDonations = donations.length;
        const livesSaved = totalDonations * 1;

        // Calculate unlocked achievements
        const unlockedAchievements = [];
        
        if (totalDonations >= 1) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.first_donation, 
                unlockedAt: donations[0].createdAt 
            });
        }
        
        if (totalDonations >= 3) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.streak_3, 
                unlockedAt: donations[2].createdAt 
            });
        }
        
        if (totalDonations >= 5) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.streak_5, 
                unlockedAt: donations[4].createdAt 
            });
        }
        
        if (totalDonations >= 10) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.lifesaver_10, 
                unlockedAt: donations[9].createdAt 
            });
        }

        // Rare blood type achievement
        if (['O-', 'AB-', 'B-', 'A-'].includes(user.bloodGroup)) {
            unlockedAchievements.push({ 
                ...ACHIEVEMENTS.rare_donor, 
                unlockedAt: donations[0]?.createdAt || user.createdAt 
            });
        }

        // Calculate next badge progress
        const calculatedPoints = totalDonations * 50;
        
        // Recalculate current badge dynamically
        let currentBadge = 'Starter';
        const badgeEntries = Object.entries(BADGES).sort((a, b) => a[1].minPoints - b[1].minPoints);
        for (const [name, info] of badgeEntries) {
            if (calculatedPoints >= info.minPoints) currentBadge = name;
        }

        const currentIndex = badgeEntries.findIndex(([name]) => name === currentBadge);
        const nextBadge = badgeEntries[currentIndex + 1];
        
        const progress = nextBadge ? {
            nextBadge: nextBadge[0],
            pointsNeeded: Math.max(0, nextBadge[1].minPoints - calculatedPoints),
            progressPercent: Math.min(100, Math.round((calculatedPoints / nextBadge[1].minPoints) * 100))
        } : { nextBadge: null, pointsNeeded: 0, progressPercent: 100 };

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    points: calculatedPoints,
                    badge: currentBadge,
                    badgeInfo: BADGES[currentBadge],
                    totalDonations,
                    livesSaved,
                    bloodGroup: user.bloodGroup,
                    city: user.city
                },
                achievements: {
                    unlocked: unlockedAchievements,
                    available: Object.values(ACHIEVEMENTS),
                    totalUnlocked: unlockedAchievements.length,
                    totalAvailable: Object.keys(ACHIEVEMENTS).length
                },
                progress,
                stats: {
                    rank: await getUserRank(userId),
                    percentile: await getUserPercentile(userId)
                }
            }
        });
    } catch (error) {
        console.error('Achievements error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Get badge information
router.get('/badges', async (req, res) => {
    try {
        res.json({ 
            status: 'success', 
            data: BADGES 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Helper functions
async function getUserRank(userId) {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        const higherRanked = await User.count({
            where: {
                role: 'DONOR',
                points: { [Op.gt]: user.points }
            }
        });
        
        return higherRanked + 1;
    } catch (error) {
        return null;
    }
}

async function getUserPercentile(userId) {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        const totalDonors = await User.count({ where: { role: 'DONOR' } });
        const lowerRanked = await User.count({
            where: {
                role: 'DONOR',
                points: { [Op.lt]: user.points }
            }
        });
        
        return Math.round((lowerRanked / totalDonors) * 100);
    } catch (error) {
        return null;
    }
}

export default router;