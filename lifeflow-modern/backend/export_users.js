import { User, sequelize } from './config/db.js';
import fs from 'fs';

async function exportUsers() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        fs.writeFileSync('users_export.json', JSON.stringify(users, null, 2));
        console.log('Users exported to users_export.json');
        await sequelize.close();
    } catch (err) {
        console.error(err);
    }
}
exportUsers();
