const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, validate } = require('../middleware');

const router = express.Router();

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Validation rules for create-admin
const createAdminValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  validate,
];

router.post('/login', loginValidation, authController.login);
router.get('/me', authenticate, authController.getMe);

// Admin management routes (protected)
router.post('/create-admin', authenticate, createAdminValidation, authController.createAdmin);
router.get('/admins', authenticate, authController.listAdmins);

module.exports = router;
