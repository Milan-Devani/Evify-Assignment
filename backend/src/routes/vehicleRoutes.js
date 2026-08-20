const express = require('express');
const { body, query } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const { authenticate, validate } = require('../middleware');

const router = express.Router();

// Validation Rules for Vehicle Creation
const createVehicleValidation = [
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required')
    .isLength({ max: 20 })
    .withMessage('Registration number cannot exceed 20 characters')
    .matches(/^[A-Z0-9-]+$/i)
    .withMessage('Registration number must contain only letters, numbers, and dashes'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ max: 100 })
    .withMessage('Model cannot exceed 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'charging', 'maintenance', 'inactive'])
    .withMessage('Status must be active, charging, maintenance, or inactive'),
  body('fleet')
    .notEmpty()
    .withMessage('Fleet ID is required')
    .isMongoId()
    .withMessage('Fleet ID must be a valid MongoDB ObjectId'),
  body('batteryLevel')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Battery level must be an integer between 0 and 100'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate,
];

// Validation Rules for Vehicle Update
const updateVehicleValidation = [
  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Registration number cannot exceed 20 characters')
    .matches(/^[A-Z0-9-]+$/i)
    .withMessage('Registration number must contain only letters, numbers, and dashes'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model cannot exceed 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'charging', 'maintenance', 'inactive'])
    .withMessage('Status must be active, charging, maintenance, or inactive'),
  body('fleet')
    .optional()
    .isMongoId()
    .withMessage('Fleet ID must be a valid MongoDB ObjectId'),
  body('batteryLevel')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Battery level must be an integer between 0 and 100'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate,
];

// Query Validation for Listing Vehicles
const getVehiclesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'charging', 'maintenance', 'inactive'])
    .withMessage('Status filter must be active, charging, maintenance, or inactive'),
  query('fleet')
    .optional()
    .isMongoId()
    .withMessage('Fleet filter must be a valid MongoDB ObjectId'),
  validate,
];

router
  .route('/')
  .get(getVehiclesValidation, vehicleController.getVehicles)
  .post(authenticate, createVehicleValidation, vehicleController.createVehicle);

router
  .route('/:id')
  .get(vehicleController.getVehicle)
  .put(authenticate, updateVehicleValidation, vehicleController.updateVehicle)
  .delete(authenticate, vehicleController.deleteVehicle);

module.exports = router;
