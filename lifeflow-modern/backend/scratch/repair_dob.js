import { User, ProfileEditRequest } from '../config/db.js';

async function repairDOB() {
    try {
        const approvedRequests = await ProfileEditRequest.findAll({
            where: { status: 'APPROVED' }
        });
        
        console.log(`Found ${approvedRequests.length} approved requests to process.`);
        
        for (const req of approvedRequests) {
            const data = typeof req.proposedData === 'string' ? JSON.parse(req.proposedData) : req.proposedData;
            if (data.dob) {
                console.log(`Updating User ${req.userId} with DOB ${data.dob}...`);
                await User.update({ dob: data.dob, age: data.age }, { where: { id: req.userId } });
            }
        }
        
        console.log("✅ Repair complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Repair failed:", error);
        process.exit(1);
    }
}

repairDOB();
