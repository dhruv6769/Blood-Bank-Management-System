import { sequelize } from '../config/db.js';

async function forceSync() {
    try {
        console.log("Attempting force sync with alter: true...");
        await sequelize.sync({ alter: true });
        console.log("✅ Sync successful!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Sync failed:", error);
        process.exit(1);
    }
}

forceSync();
