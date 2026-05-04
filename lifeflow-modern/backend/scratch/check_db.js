import { User, sequelize } from '../config/db.js';
import { Op } from 'sequelize';

async function checkSchema() {
    try {
        const [results, metadata] = await sequelize.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Users'"
        );
        console.log("Users Table Schema:");
        console.table(results);
        
        const userCount = await User.count();
        console.log(`Total Users: ${userCount}`);
        
        const sampleUsers = await User.findAll({ 
            limit: 5,
            attributes: ['id', 'name', 'dob', 'age']
        });
        console.log("Sample Users:");
        console.table(sampleUsers.map(u => u.toJSON()));
        
        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        process.exit(1);
    }
}

checkSchema();
