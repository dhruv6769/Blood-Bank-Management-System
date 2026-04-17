import { User, sequelize } from './config/db.js';
import { recalculateUserGamification } from './utils/gamification.js';

async function syncAllUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const donors = await User.findAll({ where: { role: 'DONOR' } });
        console.log(`Found ${donors.length} donors to sync.`);

        for (const donor of donors) {
            console.log(`Syncing donor: ${donor.name} (ID: ${donor.id})...`);
            const result = await recalculateUserGamification(donor.id);
            if (result) {
                console.log(`  -> New Points: ${result.points}, Badge: ${result.badge}`);
            } else {
                console.log(`  -> FAILED to sync ${donor.name}`);
            }
        }

        console.log('\n--- Sync Complete ---');
        await sequelize.close();
    } catch (err) {
        console.error('Sync Error:', err);
    }
}

syncAllUsers();
