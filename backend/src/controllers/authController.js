const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const Admin = require('../models/Admin');

// ─── Demo hardcoded user (kept for backwards compatibility) ───────────────────
const DEMO_USER = {
  id: 'usr_admin_evify_001',
  email: 'admin@evify.com',
  password: 'password123',
  name: 'Evify Fleet Admin',
  role: 'admin',
};

/**
 * Generate JWT Token
 */
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_evify_fleet_management_2026';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * @desc    Authenticate user and get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check hardcoded demo admin (plain-text compare)
    if (normalizedEmail === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {
      const token = signToken({
        userId: DEMO_USER.id,
        email: DEMO_USER.email,
        role: DEMO_USER.role,
      });

      logger.info(`Successful login (demo): ${DEMO_USER.email}`);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id:    DEMO_USER.id,
          name:  DEMO_USER.name,
          email: DEMO_USER.email,
          role:  DEMO_USER.role,
        },
      });
    }

    // 2. Check MongoDB Admin collection (bcrypt compare)
    // Use +password to include the select:false field
    const adminDoc = await Admin.findOne({ email: normalizedEmail }).select('+password');

    if (adminDoc && await adminDoc.comparePassword(password)) {
      const token = signToken({
        userId: adminDoc._id.toString(),
        email:  adminDoc.email,
        role:   adminDoc.role,
      });

      logger.info(`Successful login (db admin): ${adminDoc.email}`);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id:    adminDoc._id.toString(),
          name:  adminDoc.name,           // virtual: firstName + lastName
          email: adminDoc.email,
          role:  adminDoc.role,
        },
      });
    }

    // 3. No match
    logger.warn(`Failed login attempt for email: ${email}`);
    return next(new AppError('Invalid email or password', 401));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    // Try to find real admin doc first
    if (req.user?.userId && req.user.userId !== DEMO_USER.id) {
      const adminDoc = await Admin.findById(req.user.userId);
      if (adminDoc) {
        return res.status(200).json({
          success: true,
          user: {
            id:    adminDoc._id.toString(),
            name:  adminDoc.name,
            email: adminDoc.email,
            role:  adminDoc.role,
          },
        });
      }
    }

    // Fallback to demo user
    res.status(200).json({
      success: true,
      user: {
        id:    req.user.userId || DEMO_USER.id,
        name:  DEMO_USER.name,
        email: req.user.email  || DEMO_USER.email,
        role:  req.user.role   || DEMO_USER.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new admin user
 * @route   POST /api/auth/create-admin
 * @access  Protected
 */
const createAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, role, address } = req.body;

    // ── Field presence ──────────────────────────────────────────────────────
    const missing = [];
    if (!firstName || !firstName.trim()) missing.push('firstName');
    if (!lastName  || !lastName.trim())  missing.push('lastName');
    if (!email     || !email.trim())     missing.push('email');
    if (!phone     || !phone.trim())     missing.push('phone');
    if (!password)                        missing.push('password');
    if (!confirmPassword)                 missing.push('confirmPassword');
    if (!role      || !role.trim())      missing.push('role');
    if (!address   || !address.trim())   missing.push('address');

    if (missing.length > 0) {
      return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
    }

    // ── Name ────────────────────────────────────────────────────────────────
    if (firstName.trim().length < 2) {
      return next(new AppError('First name must be at least 2 characters', 400));
    }
    if (lastName.trim().length < 2) {
      return next(new AppError('Last name must be at least 2 characters', 400));
    }

    // ── Email ────────────────────────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // ── Phone ────────────────────────────────────────────────────────────────
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return next(new AppError('Please provide a valid phone number (10-15 digits)', 400));
    }

    // ── Password ─────────────────────────────────────────────────────────────
    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }
    if (!/[A-Z]/.test(password)) {
      return next(new AppError('Password must contain at least one uppercase letter', 400));
    }
    if (!/[0-9]/.test(password)) {
      return next(new AppError('Password must contain at least one number', 400));
    }
    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    // ── Role ─────────────────────────────────────────────────────────────────
    const ALLOWED_ROLES = ['admin', 'manager', 'operator', 'viewer'];
    if (!ALLOWED_ROLES.includes(role.trim().toLowerCase())) {
      return next(new AppError(`Invalid role. Allowed: ${ALLOWED_ROLES.join(', ')}`, 400));
    }

    // ── Address ──────────────────────────────────────────────────────────────
    if (address.trim().length < 5) {
      return next(new AppError('Address must be at least 5 characters', 400));
    }

    // ── Duplicate checks (via DB) ─────────────────────────────────────────
    const emailExists = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (emailExists) {
      return next(new AppError('An admin with this email already exists', 409));
    }

    const phoneExists = await Admin.findOne({ phone: phone.trim() });
    if (phoneExists) {
      return next(new AppError('An admin with this phone number already exists', 409));
    }

    // ── Create & save (password hashed by pre-save hook) ─────────────────
    const newAdmin = await Admin.create({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.trim().toLowerCase(),
      phone:     phone.trim(),
      password,
      role:      role.trim().toLowerCase(),
      address:   address.trim(),
    });

    logger.info(`New admin created in DB: ${newAdmin.name} <${newAdmin.email}>`);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id:        newAdmin._id.toString(),
        name:      newAdmin.name,
        firstName: newAdmin.firstName,
        lastName:  newAdmin.lastName,
        email:     newAdmin.email,
        phone:     newAdmin.phone,
        role:      newAdmin.role,
        address:   newAdmin.address,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    // Handle Mongoose duplicate key errors gracefully
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new AppError(`An admin with this ${field} already exists`, 409));
    }
    next(error);
  }
};

/**
 * @desc    List all created admins
 * @route   GET /api/auth/admins
 * @access  Protected
 */
const listAdmins = async (req, res, next) => {
  try {
    // password is select:false so never returned
    const admins = await Admin.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      admins: admins.map((a) => ({
        id:        a._id.toString(),
        name:      a.name,
        firstName: a.firstName,
        lastName:  a.lastName,
        email:     a.email,
        phone:     a.phone,
        role:      a.role,
        address:   a.address,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  createAdmin,
  listAdmins,
  DEMO_USER,
};
