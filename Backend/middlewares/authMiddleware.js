const admin = require('../config/firebase.js');
const User = require('../models/User.js');

/**
 * Protects routes by validating the Firebase ID Token
 * Automatically registers new authenticating Google users to prevent 404 drops
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    // 1. Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // 2. Query MongoDB by email or Firebase UID for flexibility
    let user = await User.findOne({ 
      $or: [
        { firebaseUid: decodedToken.uid },
        { email: decodedToken.email }
      ]
    });
    
    // 3. AUTOMATIC REGISTRATION ON THE FLY (The Missing Link)
    // If a valid Google user isn't in your MongoDB yet, create their record immediately!
    if (!user) {
      console.log(`✨ Creating fresh MongoDB database record for: ${decodedToken.email}`);
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        role: 'MEMBER' // Matches project spec defaults
      });
    } else if (!user.firebaseUid) {
      // Edge-case: If user was created without a UID beforehand, bind it now
      user.firebaseUid = decodedToken.uid;
      await user.save();
    }

    // 4. Attach full hydrated MongoDB profile document to the request pipeline
    req.user = user;
    next();
  } catch (error) {
    console.error('🚨 Auth Middleware Validation Exception:', error.message);
    return res.status(401).json({ 
      message: 'Not authorized, token invalid or expired', 
      error: error.message 
    });
  }
};

/**
 * Restricts access to specified enterprise authorization roles
 * @param  {...string} roles - Allowed access ranks (e.g., 'ADMIN', 'MANAGER')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is populated by the 'protect' middleware right before this runs
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to perform this action' 
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };