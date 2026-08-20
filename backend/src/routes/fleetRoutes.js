const express = require('express');
const { body } = require('express-validator');
const fleetController = require('../controllers/fleetController');
const { validate } = require('../middleware');

const router = express.Router();

// Validation Rules for Fleet Creation
const createFleetValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Fleet name is required')
    .isLength({ max: 50 })
    .withMessage('Fleet name cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  validate,
];

router
  .route('/')
  .get(fleetController.getFleets)
  .post(createFleetValidation, fleetController.createFleet);

router.route('/:id').get(fleetController.getFleet);

module.exports = router;
