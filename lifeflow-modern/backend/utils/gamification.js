import { Donation, User } from '../config/db.js';
import { Op } from 'sequelize';

export const BADGES = {
    'Starter': { minPoints: 0, emoji: '🌟', color: '#60A5FA', description: 'Welcome to LifeFlow!' },
    'Bronze': { minPoints: 50, emoji: '🥉', color: '#F59E0B', description: 'First milestone reached' },
    'Silver': { minPoints: 150, emoji: '🥈', color: '#94A3B8', description: 'Dedicated donor' },
    'Gold': { minPoints: 250, emoji: '🥇', color: '#FBBF24', description: 'Outstanding contributor' },
    'Platinum': { minPoints: 500, emoji: '💎', color: '#38BDF8', description: 'Elite lifesaver' },
    'Diamond': { minPoints: 1000, emoji: '💍', color: '#818CF8', description: 'Legendary hero' },
    'Legend': { minPoints: 2500, emoji: '👑', color: '#F43F5E', description: 'Ultimate champion' }
};

/**
 * Recalculates a user's points and badge strictly as: 50 points per approved/completed donation.
 * Lives impacted = 1 per donation.
 * @param {number} userId 
 */
export const recalculateUserGamification = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;

        const totalDonations = await Donation.count({
            where: {
                userId: user.id,
                status: { [Op.in]: ['COMPLETED', 'APPROVED'] }
            }
        });

        // Strictly: 50 points per donation, no bonus points
        const points = totalDonations * 50;

        // Determine badge based on points
        let newBadge = 'Starter';
        const sortedBadges = Object.entries(BADGES).sort((a, b) => a[1].minPoints - b[1].minPoints);
        for (const [badgeName, badgeInfo] of sortedBadges) {
            if (points >= badgeInfo.minPoints) {
                newBadge = badgeName;
            }
        }

        // Save
        await user.update({ points, badge: newBadge });
        return { points, badge: newBadge, totalDonations };
    } catch (error) {
        console.error('Error recalculating gamification:', error);
        return null;
    }
};
