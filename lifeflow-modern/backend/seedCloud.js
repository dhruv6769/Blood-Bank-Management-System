import bcrypt from 'bcryptjs';
import { User, Request, Donation, Camp, sequelize } from './config/db.js';

async function seed() {
    try {
        console.log('🌱 Seeding cloud database...');
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        const salt = await bcrypt.genSalt(12);
        const userPassword = await bcrypt.hash('password123', salt);

        // Check if John exists
        const john = await User.findOne({ where: { email: 'john@test.com' } });
        if (!john) {
            await User.create({
                name: 'John Doe',
                email: 'john@test.com',
                password: userPassword,
                bloodGroup: 'O+',
                age: 25,
                city: 'Ahmedabad',
                state: 'Gujarat',
                role: 'DONOR',
                points: 250,
                badge: 'Gold'
            });
            console.log('✅ John Doe seeded.');
        } else {
            console.log('ℹ️ John Doe already exists, updating points...');
            await john.update({ points: 250, badge: 'Gold' });
            console.log('✅ John Doe points updated to 250.');
        }

        // Check if Jane exists
        const jane = await User.findOne({ where: { email: 'jane@test.com' } });
        if (!jane) {
            await User.create({
                name: 'Jane Smith',
                email: 'jane@test.com',
                password: userPassword,
                bloodGroup: 'A+',
                age: 30,
                city: 'Surat',
                state: 'Gujarat',
                role: 'DONOR',
                points: 50,
                badge: 'Bronze'
            });
            console.log('✅ Jane Smith seeded.');
        }

        // Add some donations for John to make dashboard look good
        const johnUser = await User.findOne({ where: { email: 'john@test.com' } });
        if (johnUser) {
            const donationCount = await Donation.count({ where: { userId: johnUser.id } });
            if (donationCount === 0) {
                await Donation.create({
                    userId: johnUser.id,
                    bloodGroup: 'O+',
                    age: 25,
                    status: 'COMPLETED',
                    appointmentDate: '2024-01-15'
                });
                console.log('✅ Sample donation seeded for John.');
            }
        }

        console.log('🎉 Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
