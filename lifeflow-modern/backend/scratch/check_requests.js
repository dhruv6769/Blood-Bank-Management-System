import { ProfileEditRequest } from '../config/db.js';

async function checkRequests() {
    try {
        const requests = await ProfileEditRequest.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        console.log("Recent Profile Edit Requests:");
        requests.forEach(r => {
            const data = typeof r.proposedData === 'string' ? JSON.parse(r.proposedData) : r.proposedData;
            console.log(`ID: ${r.id}, Status: ${r.status}, HasDOB: ${'dob' in data}, DOB: ${data.dob}`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Error checking requests:", error);
        process.exit(1);
    }
}

checkRequests();
