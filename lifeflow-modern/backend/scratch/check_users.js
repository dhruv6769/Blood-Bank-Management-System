import { User } from '../config/db.js';

async function checkSpecificUsers() {
    try {
        const user3 = await User.findByPk(3);
        const user4 = await User.findByPk(4);
        console.log("User 3:", user3 ? user3.toJSON() : "Not found");
        console.log("User 4:", user4 ? user4.toJSON() : "Not found");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSpecificUsers();
