import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'lifeflow',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

// ─── Models ────────────────────────────────────────────────────────────────

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    bloodGroup: { type: DataTypes.STRING, allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },         // For location-based matching
    state: { type: DataTypes.STRING, allowNull: true },        // For location-based matching
    phone: { type: DataTypes.STRING, allowNull: true },        // Contact for urgent requests
    // THREE ROLES: ADMIN | DONOR | ORGANIZATION
    role: { type: DataTypes.ENUM('ADMIN', 'DONOR', 'ORGANIZATION'), defaultValue: 'DONOR' },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },      // Gamification: points
    badge: { type: DataTypes.STRING, defaultValue: 'Starter' }, // Gamification: ranks
    orgName: { type: DataTypes.STRING, allowNull: true },      // Organization display name
    orgPhone: { type: DataTypes.STRING, allowNull: true },     // Organization contact
    orgAddress: { type: DataTypes.STRING, allowNull: true },   // Organization address
    lastDonationDate: { type: DataTypes.DATEONLY, allowNull: true }, // Track donation eligibility
    avatar: { type: DataTypes.TEXT('long'), allowNull: true }, // Add avatar field for images
}, {
    tableName: 'Users'
});

const Request = sequelize.define('Request', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    patientName: { type: DataTypes.STRING, allowNull: false },
    bloodGroup: { type: DataTypes.STRING, allowNull: false },
    units: { type: DataTypes.INTEGER, allowNull: false },
    hospitalName: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: true },
    urgency: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), defaultValue: 'MEDIUM' },
    contactPhone: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'), defaultValue: 'PENDING' },
    matchedDonors: { type: DataTypes.TEXT, allowNull: true }, // JSON array of matched donor IDs
}, {
    tableName: 'Requests'
});

const Donation = sequelize.define('Donation', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bloodGroup: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    condition: { type: DataTypes.STRING, allowNull: true },
    campId: { type: DataTypes.INTEGER, allowNull: true },      // Link to camp if booked
    appointmentDate: { type: DataTypes.DATEONLY, allowNull: true }, // Scheduled date
    appointmentTime: { type: DataTypes.STRING, allowNull: true },   // Time slot (e.g., "10:00-10:30")
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'), defaultValue: 'PENDING' }
}, {
    tableName: 'Donations'
});

// NEW: Donation Camp model (created by organizations, approved by admin)
const Camp = sequelize.define('Camp', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Gujarat' },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.STRING, allowNull: false },
    endTime: { type: DataTypes.STRING, allowNull: false },
    totalSlots: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
    bookedSlots: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    bloodGroupsNeeded: { type: DataTypes.STRING, allowNull: true }, // Comma-separated: "A+,B-,O+"
    contactPhone: { type: DataTypes.STRING, allowNull: true },
    lat: { type: DataTypes.FLOAT, allowNull: true },
    lng: { type: DataTypes.FLOAT, allowNull: true },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
    adminNote: { type: DataTypes.STRING, allowNull: true }, // Admin rejection reason
}, {
    tableName: 'Camps'
});

// NEW: Appointment/Booking model for time slot management
const Appointment = sequelize.define('Appointment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    donationId: { type: DataTypes.INTEGER, allowNull: false },
    campId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    appointmentDate: { type: DataTypes.DATEONLY, allowNull: false },
    timeSlot: { type: DataTypes.STRING, allowNull: false }, // e.g., "10:00-10:30"
    status: { type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'), defaultValue: 'SCHEDULED' },
}, {
    tableName: 'Appointments'
});

// NEW: Notification model for urgent requests and alerts
const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('URGENT_REQUEST', 'CAMP_APPROVED', 'DONATION_APPROVED', 'GENERAL'), defaultValue: 'GENERAL' },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    requestId: { type: DataTypes.INTEGER, allowNull: true },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'Notifications'
});

// NEW: Profile Edit Request model for admin approval
const ProfileEditRequest = sequelize.define('ProfileEditRequest', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    proposedData: { type: DataTypes.JSON, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' }
}, {
    tableName: 'ProfileEditRequests'
});

// NEW: Community Post Model
const Post = sequelize.define('Post', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'Posts'
});

// NEW: Community Comment Model
const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'Comments'
});

// NEW: Community Like Model
const Like = sequelize.define('Like', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'Likes'
});

// NEW: Support Message Model
const SupportMessage = sequelize.define('SupportMessage', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('OPEN', 'RESOLVED', 'REPLIED'), defaultValue: 'OPEN' },
    adminReply: { type: DataTypes.TEXT, allowNull: true },
    isReadByUser: { type: DataTypes.BOOLEAN, defaultValue: true },
    isReadByAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'SupportMessages'
});


// ─── Relationships ──────────────────────────────────────────────────────────
User.hasMany(Request, { foreignKey: 'userId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Donation, { foreignKey: 'userId', as: 'donations' });
Donation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Camp, { foreignKey: 'organizationId', as: 'camps' });
Camp.belongsTo(User, { foreignKey: 'organizationId', as: 'organization' });

Camp.hasMany(Donation, { foreignKey: 'campId', as: 'donations' });
Donation.belongsTo(Camp, { foreignKey: 'campId', as: 'camp' });

Camp.hasMany(Appointment, { foreignKey: 'campId', as: 'appointments' });
Appointment.belongsTo(Camp, { foreignKey: 'campId', as: 'camp' });

User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Donation.hasOne(Appointment, { foreignKey: 'donationId', as: 'appointment' });
Appointment.belongsTo(Donation, { foreignKey: 'donationId', as: 'donation' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ProfileEditRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ProfileEditRequest, { foreignKey: 'userId', as: 'editRequests' });

// Community Relationships
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(SupportMessage, { foreignKey: 'userId', as: 'supportMessages' });
SupportMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Request, Donation, Camp, Appointment, Notification, ProfileEditRequest, Post, Comment, Like, SupportMessage };
