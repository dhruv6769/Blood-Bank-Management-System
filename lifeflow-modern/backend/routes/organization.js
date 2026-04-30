import express from 'express';
import { Camp, User, Donation } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getCityCoordinatesWithFallback, getSupportedCities } from '../utils/geocoding.js';
import { Op } from 'sequelize';

const router = express.Router();

// ─── Get Supported Cities (Public) ───────────────────────────────────────────
router.get('/cities', (req, res) => {
    res.json({ 
        status: 'success', 
        cities: getSupportedCities() 
    });
});

// ─── Middleware: Only Organizations ─────────────────────────────────────────
const verifyOrg = (req, res, next) => {
    if (req.user.role === 'ORGANIZATION') return next();
    return res.status(403).json({ status: 'error', message: 'Access denied. Organization role required.' });
};

// ─── Create a new Camp (Organization only) ───────────────────────────────────
router.post('/camps', verifyToken, verifyOrg, async (req, res) => {
    try {
        const { name, description, address, city, state, date, startTime, endTime, totalSlots, bloodGroupsNeeded, contactPhone, lat, lng } = req.body;

        if (!name || !address || !city || !date || !startTime || !endTime) {
            return res.status(400).json({ status: 'error', message: 'Name, address, city, date and times are required.' });
        }

        // Auto-geocode the city if coordinates not provided
        let coordinates = { lat: null, lng: null };
        if (lat && lng) {
            // Use provided coordinates
            coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
        } else {
            // Auto-geocode from city name
            coordinates = getCityCoordinatesWithFallback(city);
            console.log(`Auto-geocoded ${city} to coordinates:`, coordinates);
        }

        const camp = await Camp.create({
            name,
            description,
            address,
            city,
            state: state || 'Gujarat',
            date,
            startTime,
            endTime,
            totalSlots: totalSlots || 100,
            bloodGroupsNeeded,
            contactPhone,
            lat: coordinates.lat,
            lng: coordinates.lng,
            organizationId: req.user.id,
            status: 'PENDING'
        });

        res.status(201).json({ 
            status: 'success', 
            message: `Camp submitted for approval. Location automatically set for ${city}.`, 
            camp: {
                ...camp.toJSON(),
                autoGeocodedCity: !lat && !lng ? city : null
            }
        });
    } catch (error) {
        console.error('Create Camp Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create camp.' });
    }
});

// ─── Get My Camps (Organization) ─────────────────────────────────────────────
router.get('/camps/my', verifyToken, verifyOrg, async (req, res) => {
    try {
        const camps = await Camp.findAll({
            where: { organizationId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', camps });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch your camps.' });
    }
});

// ─── Get All Approved Camps (Public) ─────────────────────────────────────────
router.get('/camps', async (req, res) => {
    try {
        console.log('Fetching approved camps...');
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentTimeStr = now.toTimeString().slice(0, 5); // "HH:MM"

        const campsDb = await Camp.findAll({
            where: { 
                status: 'APPROVED',
                date: { [Op.gte]: todayStr }
            },
            include: [{ model: User, as: 'organization', attributes: ['name', 'orgName'] }],
            order: [['date', 'ASC']]
        });

        // Filter out camps whose date is today but endTime has already passed
        const activeCamps = campsDb.filter(camp => {
            // camp.date is returned as YYYY-MM-DD from the database
            const campDate = camp.date;
            if (campDate > todayStr) return true; // Future dates are fine
            if (campDate === todayStr) {
                // For today's camp, check if end time is still in the future
                return camp.endTime >= currentTimeStr;
            }
            return false;
        });

        console.log(`Found ${activeCamps.length} active approved camps`);

        // Ensure all camps have coordinates (geocode if missing)
        const campsWithCoords = activeCamps.map(camp => {
            const campData = camp.toJSON();
            
            // If coordinates are missing, auto-geocode from city
            if (!campData.lat || !campData.lng) {
                const coordinates = getCityCoordinatesWithFallback(campData.city);
                campData.lat = coordinates.lat;
                campData.lng = coordinates.lng;
                campData.autoGeocoded = true;
            }
            
            return campData;
        });

        console.log('Returning camps:', campsWithCoords.map(c => ({ id: c.id, name: c.name, status: c.status })));
        res.json({ status: 'success', camps: campsWithCoords });
    } catch (error) {
        console.error('Fetch camps error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch camps.' });
    }
});

// ─── Test endpoint to check if API is working ─────────────────────────────────
router.get('/test', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'Organization API is working',
        timestamp: new Date().toISOString()
    });
});

export default router;
