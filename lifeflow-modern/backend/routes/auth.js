import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../config/db.js';
import { generateToken, authLimiter, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply rate limiting to auth endpoints
router.use(authLimiter);

// ─── Register ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, bloodGroup, age, role, orgName, orgPhone, orgAddress } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'error', message: 'Name, email, and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters long' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ status: 'error', message: 'Invalid email format' });
        }

        // Validate role
        const allowedRoles = ['DONOR', 'ORGANIZATION'];
        const userRole = allowedRoles.includes(role) ? role : 'DONOR';

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ status: 'error', message: 'User with this email already exists' });
        }

        // Hash password with stronger salt
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            bloodGroup,
            age: age === '' ? null : age,
            dob: (req.body.dob === '' ? null : req.body.dob) || (role === 'DONOR' ? (age === '' ? null : age) : null), // Handle if dob is passed explicitly or via age (which might be the date string)
            role: userRole,
            // Organization-specific fields
            orgName: userRole === 'ORGANIZATION' ? orgName : null,
            orgPhone: userRole === 'ORGANIZATION' ? orgPhone : null,
            orgAddress: userRole === 'ORGANIZATION' ? orgAddress : null,
        });

        console.log('New user created:', {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });

        // Generate secure token
        const token = generateToken(newUser);

        // Don't send password in response
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            bloodGroup: newUser.bloodGroup,
            age: newUser.age,
            orgName: newUser.orgName,
            phone: newUser.phone,
            city: newUser.city,
            state: newUser.state,
            avatar: newUser.avatar,
            dob: newUser.dob
        };

        res.status(201).json({
            status: 'success',
            message: 'Registered successfully',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error during registration' });
    }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ status: 'error', message: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'No user found');
        
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ status: 'error', message: 'Incorrect password' });
        }

        console.log('Generating token...');
        // Generate secure token
        const token = generateToken(user);
        console.log('Token generated successfully');

        // Don't send password in response
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            bloodGroup: user.bloodGroup,
            age: user.age,
            orgName: user.orgName,
            phone: user.phone,
            city: user.city,
            state: user.state,
            avatar: user.avatar,
            dob: user.dob
        };

        console.log('Login successful for user:', userResponse);
        res.json({
            status: 'success',
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error during login' });
    }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
    try {
        // In production, you would add the token to a blacklist
        // For now, we'll just return success
        res.json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Logout failed' });
    }
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ status: 'error', message: 'Refresh token required' });
        }

        // In production, validate refresh token against database
        // For now, we'll return a simple response
        res.json({
            status: 'success',
            message: 'Token refresh endpoint - implement refresh token logic'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Token refresh failed' });
    }
});

// ─── Test endpoint to check users in database ────────────────────────────────
router.get('/test-users', async (req, res) => {
    try {
        const allUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        
        console.log('All users in database:', allUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role
        })));
        
        res.json({
            status: 'success',
            message: 'Users fetched successfully',
            users: allUsers,
            count: allUsers.length
        });
    } catch (error) {
        console.error('Test users error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── Get Current User ─────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            bloodGroup: user.bloodGroup,
            age: user.age,
            orgName: user.orgName,
            phone: user.phone,
            city: user.city,
            state: user.state,
            avatar: user.avatar,
            dob: user.dob
        };
        
        res.json({ status: 'success', user: userResponse });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
