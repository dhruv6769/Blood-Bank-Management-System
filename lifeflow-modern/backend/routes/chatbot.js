import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import { User } from '../config/db.js';

const router = express.Router();

// AI Chatbot endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, mode } = req.body;
        
        if (!message) {
            return res.status(400).json({ status: 'error', message: 'Message is required' });
        }

        // --- CONTEXT AWARENESS (Item 3) ---
        let userContext = null;
        try {
            const authHeader = req.header('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.replace('Bearer ', '');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findByPk(decoded.id);
                if (user) {
                    userContext = {
                        name: user.name,
                        role: user.role,
                        bloodGroup: user.bloodGroup,
                        city: user.city,
                        lastDonationDate: user.lastDonDate
                    };
                }
            }
        } catch (e) {
            console.log("Chatbot optional auth error (ignoring):", e.message);
        }

        let response;
        
        // --- TRUE LLM INTEGRATION (Item 1 & 4) ---
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const systemInstruction = `
You are the advanced LifeFlow Nexus Medical AI Assistant.
Your goal is to assist users with blood donation, medical screening, and emergencies.
${userContext ? `IMPORTANT: You are currently talking to an authenticated user:
Name: ${userContext.name}
Role: ${userContext.role}
Blood Group: ${userContext.bloodGroup || 'Unknown'}
City: ${userContext.city || 'Unknown'}
Use their name naturally and tailor your advice to their blood type and role if applicable.` : 'The user is not currently logged in.'}

You must return a valid JSON object with the exact following structure:
{
  "role": "LifeFlow Assistant",
  "message": "Your conversational text response here (use markdown for formatting).",
  "ui_action": null, // Use "SHOW_MAP" if they explicitly ask to find camps/locations, otherwise null.
  "actions": [] // Array of action buttons, e.g. [{"type": "navigate", "label": "Donate", "url": "/dashboard?section=donate", "requireAuth": true}]
}
Always answer strictly in this JSON format without any backticks or markdown code blocks surrounding it.
`;
                const prompt = `${systemInstruction}\n\nUser Message: ${message}`;
                const result = await model.generateContent(prompt);
                let responseText = result.response.text().trim();
                
                // Parse JSON from markdown block if necessary
                if (responseText.startsWith('\`\`\`json')) {
                    responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
                } else if (responseText.startsWith('\`\`\`')) {
                    responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
                }
                
                response = JSON.parse(responseText);
                return res.json({ status: 'success', data: response });
            } catch (aiError) {
                console.error("Gemini AI Error, falling back to rule-based:", aiError);
            }
        }

        // --- FALLBACK TO RULE-BASED ---
        switch (mode) {
            case 'screening':
                response = handleMedicalScreening(message);
                break;
            case 'hematology':
                response = handleBloodCompatibility(message);
                break;
            case 'recovery':
                response = handleRecoveryAdvice(message);
                break;
            case 'emergency':
                response = analyzeEmergencyRequest(message);
                break;
            default:
                response = handleGeneralInquiry(message);
        }
        
        // Check for UI Action fallback mapping (Item 4)
        if (!response.ui_action && (message.toLowerCase().includes('camps') || message.toLowerCase().includes('find camp') || message.toLowerCase().includes('map'))) {
            response.ui_action = 'SHOW_MAP';
        }

        res.json({ status: 'success', data: response });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Medical Screening Assistant
function handleMedicalScreening(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for eligibility criteria
    const responses = {
        age: "Thank you for your interest in donating blood. To ensure donor safety, we require donors to be at least 18 years old. Could you please confirm your age?",
        weight: "For your safety during donation, we require donors to weigh at least 50kg. Could you please share your current weight?",
        tattoo: "For infection control, we cannot accept donations from individuals who have gotten tattoos or piercings in the last 6 months. Have you had any tattoos or piercings recently?",
        medication: "Certain medications may affect your eligibility to donate. Are you currently taking any prescription medications?",
        eligible: "Excellent! Based on your responses, you appear to be eligible to donate blood. Your willingness to donate can save up to 3 lives. Would you like to book an appointment at one of our donation camps?",
        ineligible: "Thank you for your interest in donating. Based on your responses, we cannot accept your donation at this time. This is for your safety and the safety of blood recipients. Please consider donating when you meet all eligibility criteria."
    };

    // Simple keyword matching for demo
    if (lowerMessage.includes('age') || lowerMessage.includes('old')) {
        return {
            role: "Medical Screening Assistant",
            message: responses.age,
            nextQuestion: "weight"
        };
    } else if (lowerMessage.includes('weight') || lowerMessage.includes('kg')) {
        return {
            role: "Medical Screening Assistant",
            message: responses.weight,
            nextQuestion: "tattoo"
        };
    } else if (lowerMessage.includes('tattoo') || lowerMessage.includes('piercing')) {
        return {
            role: "Medical Screening Assistant",
            message: responses.tattoo,
            nextQuestion: "medication"
        };
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
        return {
            role: "Medical Screening Assistant",
            message: responses.medication,
            nextQuestion: "summary"
        };
    } else if (lowerMessage.includes('yes') && lowerMessage.includes('eligible')) {
        return {
            role: "Medical Screening Assistant",
            message: responses.eligible,
            action: "book_appointment"
        };
    } else {
        return {
            role: "Medical Screening Assistant",
            message: "Welcome to the blood donation screening. I'll guide you through our eligibility checklist. First, are you 18 years or older?",
            nextQuestion: "age"
        };
    }
}

// Hematologist - Blood Compatibility Expert
function handleBloodCompatibility(message) {
    const bloodTypes = {
        'o-': {
            name: 'O Negative',
            canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            canReceiveFrom: ['O-'],
            description: 'Universal Donor - Your blood can be given to anyone in emergencies!'
        },
        'o+': {
            name: 'O Positive',
            canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
            canReceiveFrom: ['O-', 'O+'],
            description: 'Most common blood type'
        },
        'a-': {
            name: 'A Negative',
            canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
            canReceiveFrom: ['A-', 'O-'],
            description: ''
        },
        'a+': {
            name: 'A Positive',
            canDonateTo: ['A+', 'AB+'],
            canReceiveFrom: ['A-', 'A+', 'O-', 'O+'],
            description: ''
        },
        'b-': {
            name: 'B Negative',
            canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
            canReceiveFrom: ['B-', 'O-'],
            description: ''
        },
        'b+': {
            name: 'B Positive',
            canDonateTo: ['B+', 'AB+'],
            canReceiveFrom: ['B-', 'B+', 'O-', 'O+'],
            description: ''
        },
        'ab-': {
            name: 'AB Negative',
            canDonateTo: ['AB-', 'AB+'],
            canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
            description: 'Universal Plasma Donor'
        },
        'ab+': {
            name: 'AB Positive',
            canDonateTo: ['AB+'],
            canReceiveFrom: ['All blood types'],
            description: 'Universal Recipient - You can receive blood from anyone!'
        }
    };

    // Extract blood type from message
    const lowerMessage = message.toLowerCase();
    let matchedType = null;
    
    for (const [key, info] of Object.entries(bloodTypes)) {
        if (lowerMessage.includes(key) || lowerMessage.includes(info.name.toLowerCase())) {
            matchedType = info;
            break;
        }
    }

    if (matchedType) {
        return {
            role: "Expert Hematologist",
            message: `As an ${matchedType.name} donor:\n\n✅ You can DONATE to: ${matchedType.canDonateTo.join(', ')}\n✅ You can RECEIVE from: ${matchedType.canReceiveFrom.join(', ')}\n\n${matchedType.description ? `💡 ${matchedType.description}` : ''}\n\nRemember: O- is the Universal Donor (can give to anyone), AB+ is the Universal Recipient (can receive from anyone).`,
            bloodType: matchedType.name
        };
    }

    return {
        role: "Expert Hematologist",
        message: "I'm here to explain blood compatibility. Please tell me your blood type (e.g., 'O Negative', 'A Positive', 'B+', etc.) and I'll explain which types you can donate to and receive from."
    };
}

// Recovery Room Nurse
function handleRecoveryAdvice(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('dizzy') || lowerMessage.includes('lightheaded')) {
        return {
            role: "Recovery Room Nurse",
            message: "If you're feeling dizzy or lightheaded, please:\n\n1. Sit down immediately or lie down with your feet elevated\n2. Drink plenty of fluids (water or juice)\n3. Eat a light snack if you haven't eaten recently\n4. Rest for 15-20 minutes\n5. If symptoms persist, inform our staff immediately\n\nThank you for your life-saving contribution! Your body needs time to adjust after donation. 💕"
        };
    }

    return {
        role: "Recovery Room Nurse",
        message: "Welcome to recovery! Here's your post-donation care plan:\n\n💧 Drink plenty of fluids for the next 24-48 hours\n🚫 Avoid heavy lifting or strenuous exercise for 24 hours\n🩹 Keep the bandage on for 5 hours\n🍎 Eat iron-rich foods (red meat, spinach, beans)\n😴 Get plenty of rest\n\nIf you experience any dizziness, nausea, or bleeding, please contact us immediately. Thank you for being a hero! 🦸‍♀️"
    };
}

// Emergency Request Analyzer
function analyzeEmergencyRequest(message) {
    // Extract hospital name
    const hospitalRegex = /(?:at|in|from)\s+([A-Z][a-zA-Z\s]+Hospital|Medical Center|Clinic)/i;
    const hospitalMatch = message.match(hospitalRegex);
    const hospital = hospitalMatch ? hospitalMatch[1] : 'Unknown Hospital';

    // Extract blood type
    const bloodTypeRegex = /(O|A|B|AB)[+-]?/i;
    const bloodMatch = message.match(bloodTypeRegex);
    const bloodType = bloodMatch ? bloodMatch[0].toUpperCase() : 'Unknown';

    // Extract units
    const unitsRegex = /(\d+)\s*(?:units?|pints?)/i;
    const unitsMatch = message.match(unitsRegex);
    const units = unitsMatch ? parseInt(unitsMatch[1]) : 1;

    // Determine urgency
    const criticalKeywords = ['urgent', 'emergency', 'critical', 'immediate', 'life-threatening', 'asap'];
    const isCritical = criticalKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );

    return {
        role: "Emergency Request Analyzer",
        message: `🚨 EMERGENCY REQUEST ANALYSIS 🚨\n\n🏥 Hospital: ${hospital}\n🩸 Blood Type Needed: ${bloodType}\n💉 Units Required: ${units}\n⚠️ Urgency Level: ${isCritical ? 'CRITICAL' : 'ROUTINE'}\n\n${isCritical ? '❗ This request requires immediate attention! Notify all compatible donors.' : '📋 This is a routine request. Process through normal channels.'}`,
        data: {
            hospital,
            bloodType,
            units,
            urgency: isCritical ? 'CRITICAL' : 'ROUTINE'
        }
    };
}

// General inquiry handler
function handleGeneralInquiry(message) {
    console.log(`>>> CHATBOT INQUIRY: "${message}"`);
    const lowerMessage = message.toLowerCase();
    const trimmedMessage = message.trim();
    
    // Handle numeric inputs (legacy mode selection)
    if (trimmedMessage === '1' || lowerMessage.includes('medical screening') || lowerMessage.includes('eligibility')) {
        return {
            role: "Medical Screening Assistant",
            message: "Great! I'll help you check your eligibility to donate blood. 🩺\n\nTo donate blood safely, you must meet these criteria:\n\n✅ **Age**: 18+ years old\n✅ **Weight**: 50kg+ (110 lbs+)\n✅ **Health**: Generally good health\n✅ **Recent donations**: Last donation 56+ days ago\n✅ **Tattoos/Piercings**: None in last 6 months\n\nWould you like to go through the screening questions?",
            actions: [
                { type: 'navigate', label: '🩺 Start Screening', url: '/dashboard?section=request', requireAuth: true },
                { type: 'navigate', label: '🩸 Donate Now', url: '/camps', requireAuth: false },
                { type: 'navigate', label: '🔐 Login First', url: '/login', requireAuth: false }
            ]
        };
    }
    
    if (trimmedMessage === '2' || lowerMessage.includes('hematology') || lowerMessage.includes('blood compatibility')) {
        return {
            role: "Expert Hematologist",
            message: "I'll help you understand blood compatibility! 🩸\n\nTell me your blood type (A+, B-, O+, AB-, etc.) and I'll explain:\n\n🔄 **Who you can donate to**\n🔄 **Who you can receive from**\n🌟 **Special compatibility facts**\n\nExample: \"I'm O negative\" or \"What about AB positive?\"",
            actions: [
                { type: 'navigate', label: '🩸 Learn More', url: '/heroes', requireAuth: false }
            ]
        };
    }
    
    if (trimmedMessage === '3' || lowerMessage.includes('recovery') || lowerMessage.includes('post-donation')) {
        return {
            role: "Recovery Room Nurse",
            message: "Welcome to recovery! Here's your post-donation care plan: 💊\n\n💧 **Hydration**: Drink plenty of fluids for 24-48 hours\n🚫 **Activity**: Avoid heavy lifting for 24 hours\n🩹 **Bandage**: Keep on for 5 hours minimum\n🍎 **Nutrition**: Eat iron-rich foods (red meat, spinach, beans)\n😴 **Rest**: Get plenty of sleep tonight\n\nFeeling dizzy or unwell? Let me know immediately!",
            actions: [
                { type: 'navigate', label: '🏥 Emergency Help', url: 'tel:911', requireAuth: false }
            ]
        };
    }
    
    if (trimmedMessage === '4' || lowerMessage.includes('emergency') || lowerMessage.includes('analyze')) {
        return {
            role: "Emergency Request Analyzer",
            message: "🚨 Emergency Blood Request Analysis 🚨\n\nI can analyze urgent blood requests. Please provide:\n\n🏥 **Hospital name**\n🩸 **Blood type needed**\n💉 **Number of units**\n⚠️ **Urgency level**\n👤 **Patient details**\n\nExample: \"Urgent: Need 3 units of O- blood at City Hospital for emergency surgery\"",
            actions: [
                { type: 'navigate', label: '📋 Submit Emergency Request', url: '/dashboard?section=request', requireAuth: true },
                { type: 'navigate', label: '🆘 Call 911', url: 'tel:911', requireAuth: false }
            ]
        };
    }
    
    // Navigation and form requests
    if (lowerMessage.includes('how to donate') || lowerMessage.includes('donate blood') || lowerMessage.includes('offer donation') || lowerMessage.includes('blood donation form')) {
        return {
            role: "LifeFlow Assistant",
            message: "Perfect! I'll help you donate blood and save lives! 🩸\n\nTo donate blood, you can:\n\n🩸 **Submit Donation Offer** - Fill out the donation form\n📅 **Book Appointment** - Schedule at a donation camp\n🗺️ **Find Camps** - See camps near you on the map\n🩺 **Check Eligibility** - Medical screening first\n\nReady to become a hero?",
            actions: [
                { type: 'navigate', label: '🩸 Go to Donation Form', url: '/dashboard?section=donate', requireAuth: true },
                { type: 'navigate', label: '🗺️ Find Donation Camps', url: '/camps', requireAuth: false },
                { type: 'navigate', label: '🔐 Login to Donate', url: '/login', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('blood request') || lowerMessage.includes('need blood') || lowerMessage.includes('request blood') || lowerMessage.includes('blood request form')) {
        return {
            role: "LifeFlow Assistant",
            message: "I'll help you submit a blood request for a patient! 🚨\n\nFor blood requests, you'll need:\n\n📋 **Patient Information** (Name, Age, Gender)\n🩸 **Blood Type Required** (A+, B-, O+, etc.)\n🏥 **Hospital Details** (Name, Address)\n📍 **Location & Contact**\n⚠️ **Urgency Level** (Emergency/Routine)\n\nLet me take you to the blood request form:",
            actions: [
                { type: 'navigate', label: '📋 Submit Blood Request', url: '/dashboard?section=request', requireAuth: true },
                { type: 'navigate', label: '🔐 Login to Request', url: '/login', requireAuth: false },
                { type: 'navigate', label: '🆘 Emergency? Call 911', url: 'tel:911', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('create account') || lowerMessage.includes('registration form')) {
        return {
            role: "LifeFlow Assistant",
            message: "Welcome to LifeFlow! 🎉 Join our life-saving community!\n\nCreating an account allows you to:\n\n✅ **Submit blood requests** for patients\n✅ **Offer blood donations** to save lives\n✅ **Book appointments** at donation camps\n✅ **Track donation history** and impact\n✅ **Earn points and badges** 🏆\n✅ **Get matched** for emergency requests\n\nReady to become a hero?",
            actions: [
                { type: 'navigate', label: '📝 Register as Donor', url: '/register', requireAuth: false },
                { type: 'navigate', label: '🔐 Login Instead', url: '/login', requireAuth: false },
                { type: 'navigate', label: '🏥 Register Organization', url: '/register', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('login') || lowerMessage.includes('sign in') || lowerMessage.includes('log in')) {
        return {
            role: "LifeFlow Assistant",
            message: "Welcome back to LifeFlow! 👋\n\nLog in to access your dashboard and:\n\n🩸 **Submit donation offers**\n📋 **Request blood for patients**\n📅 **Book appointments at camps**\n🏆 **View your points and badges**\n📊 **Track your donation impact**\n🔔 **Get emergency alerts**\n\nLet's get you signed in:",
            actions: [
                { type: 'navigate', label: '🔐 Login Now', url: '/login', requireAuth: false },
                { type: 'navigate', label: '📝 Register Instead', url: '/register', requireAuth: false },
                { type: 'navigate', label: '❓ Forgot Password?', url: '/login', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('camps') || lowerMessage.includes('donation camp') || lowerMessage.includes('find camp')) {
        return {
            role: "LifeFlow Assistant",
            message: "Our interactive map shows all approved donation camps near you! You can:\n\n🗺️ **View camps on map**\n📍 **Search by city**\n📅 **See dates and times**\n📞 **Get contact info**\n📝 **Book appointments**",
            actions: [
                { type: 'navigate', label: '🗺️ View Camps Map', url: '/camps', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('leaderboard') || lowerMessage.includes('heroes') || lowerMessage.includes('top donors')) {
        return {
            role: "LifeFlow Assistant",
            message: "Check out our Heroes Leaderboard! See:\n\n🏆 **Top donors**\n🥇 **Badge rankings**\n⭐ **Points system**\n🦸 **Community heroes**\n\nEvery donation earns you points and helps save lives!",
            actions: [
                { type: 'navigate', label: '🏆 View Heroes', url: '/heroes', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
        return {
            role: "LifeFlow Assistant",
            message: "Great! Let's book your donation appointment! 📅\n\nOur appointment system makes it easy:\n\n1️⃣ **Choose a camp** from our interactive map\n2️⃣ **Select date** that works for you\n3️⃣ **Pick time slot** (30-minute slots available)\n4️⃣ **Confirm booking** and get reminder\n\nReady to schedule your life-saving donation?",
            actions: [
                { type: 'navigate', label: '📅 Book Appointment', url: '/camps', requireAuth: false },
                { type: 'navigate', label: '🗺️ View All Camps', url: '/camps', requireAuth: false },
                { type: 'navigate', label: '🔐 Login First', url: '/login', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('my account') || lowerMessage.includes('profile')) {
        return {
            role: "LifeFlow Assistant",
            message: "Your dashboard is your command center! 🎛️\n\nFrom your dashboard you can:\n\n🩸 **Submit donation offers**\n📋 **Request blood for patients**\n📊 **View your donation history**\n🏆 **Check points and badges**\n📅 **Manage appointments**\n🔔 **See emergency alerts**\n\nLet me take you there:",
            actions: [
                { type: 'navigate', label: '🎛️ Go to Dashboard', url: '/dashboard?section=main', requireAuth: true },
                { type: 'navigate', label: '🔐 Login Required', url: '/login', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('form') || lowerMessage.includes('fill') || lowerMessage.includes('submit')) {
        return {
            role: "LifeFlow Assistant",
            message: "I can help you with our forms! 📝\n\nWhich form do you need?\n\n🩸 **Donation Offer Form** - Offer to donate blood\n📋 **Blood Request Form** - Request blood for patient\n📝 **Registration Form** - Create new account\n📅 **Appointment Form** - Book donation slot\n\nSelect the form you need:",
            actions: [
                { type: 'navigate', label: '🩸 Donation Form', url: '/dashboard?section=donate', requireAuth: true },
                { type: 'navigate', label: '📋 Request Form', url: '/dashboard?section=request', requireAuth: true },
                { type: 'navigate', label: '📝 Registration', url: '/register', requireAuth: false },
                { type: 'navigate', label: '📅 Appointment', url: '/camps', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assistance')) {
        return {
            role: "LifeFlow Assistant",
            message: "I'm here to help! 🤝 Here's what I can assist you with:\n\n🩺 **Medical Questions** - Eligibility, blood types, recovery\n📋 **Navigation Help** - Find forms, pages, features\n🩸 **Donation Process** - How to donate, where, when\n📞 **Emergency Support** - Urgent blood requests\n🏆 **Account Help** - Registration, login, dashboard\n\nWhat specific help do you need?",
            actions: [
                { type: 'navigate', label: '🩸 How to Donate', url: '/camps', requireAuth: false },
                { type: 'navigate', label: '📋 How to Request', url: '/login', requireAuth: false },
                { type: 'navigate', label: '📞 Emergency Help', url: 'tel:911', requireAuth: false },
                { type: 'navigate', label: '🏆 View Heroes', url: '/heroes', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('critical') || lowerMessage.includes('911')) {
        return {
            role: "LifeFlow Assistant",
            message: "🚨 EMERGENCY BLOOD REQUEST 🚨\n\nFor life-threatening emergencies:\n\n📞 **Call 911 immediately**\n🏥 **Contact hospital blood bank directly**\n⚡ **Use our emergency request form**\n🩸 **Auto-matching will find donors**\n\nI can help analyze your emergency request or direct you to forms:",
            actions: [
                { type: 'navigate', label: '🆘 Call 911 Now', url: 'tel:911', requireAuth: false },
                { type: 'navigate', label: '📋 Emergency Request', url: '/dashboard?section=request', requireAuth: true },
                { type: 'navigate', label: '🔐 Login for Request', url: '/login', requireAuth: false }
            ]
        };
    }
    
    // Additional navigation patterns
    if (lowerMessage.includes('home') || lowerMessage.includes('homepage') || lowerMessage.includes('main page')) {
        return {
            role: "LifeFlow Assistant",
            message: "Welcome to LifeFlow! 🏠\n\nOur homepage features:\n\n🩸 **Hero Section** - Learn about blood donation\n📊 **Impact Statistics** - See lives saved\n🏆 **Top Donors** - Community heroes\n🗺️ **Quick Access** - Find camps, register, login\n\nLet me take you to the homepage:",
            actions: [
                { type: 'navigate', label: '🏠 Go to Homepage', url: '/', requireAuth: false }
            ]
        };
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('support')) {
        return {
            role: "LifeFlow Assistant",
            message: "Need to contact us? 📞\n\nHere are your options:\n\n🤖 **AI Assistant** - That's me! Ask anything\n📧 **Email Support** - support@lifeflow.com\n📞 **Emergency Line** - 911 for urgent requests\n🏥 **Local Blood Banks** - Find nearest location\n💬 **Live Chat** - Available 24/7 (this chat!)\n\nI'm here to help right now!",
            actions: [
                { type: 'navigate', label: '📧 Email Support', url: 'mailto:support@lifeflow.com', requireAuth: false },
                { type: 'navigate', label: '🆘 Emergency Line', url: 'tel:911', requireAuth: false },
                { type: 'navigate', label: '🗺️ Find Blood Banks', url: '/camps', requireAuth: false }
            ]
        };
    }

    return {
        role: "LifeFlow Assistant",
        message: "Hello! I'm your LifeFlow AI Assistant! 🤖💝\n\nI can help you with:\n\n🩺 **Medical Screening** - Check donation eligibility\n🩸 **Blood Compatibility** - Learn about blood types\n💊 **Recovery Advice** - Post-donation care tips\n🚨 **Emergency Analysis** - Analyze urgent requests\n📋 **Navigation Help** - Find forms and pages\n\n**Quick Actions:**\n• Say \"how to donate blood\" for donation help\n• Say \"blood request\" for requesting blood\n• Say \"register\" to create an account\n• Say \"login\" to access your dashboard\n\nWhat can I help you with today?",
        actions: [
            { type: 'navigate', label: '🩸 Donate Blood', url: '/camps', requireAuth: false },
            { type: 'navigate', label: '📋 Request Blood', url: '/login', requireAuth: false },
            { type: 'navigate', label: '🏆 View Heroes', url: '/heroes', requireAuth: false },
            { type: 'navigate', label: '📝 Register', url: '/register', requireAuth: false }
        ]
    };
}

export default router;