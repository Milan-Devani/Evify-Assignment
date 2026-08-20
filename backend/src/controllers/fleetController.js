const { Fleet } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * @desc    Create a new fleet
 * @route   POST /api/fleets
 * @access  Public / Protected
 */
const createFleet = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const fleet = await Fleet.create({
      name,
      description,
    });

    logger.info(`Fleet created: ${fleet.name} (ID: ${fleet._id})`);

    res.status(201).json({
      success: true,
      message: 'Fleet created successfully',
      data: fleet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all fleets sorted by name
 * @route   GET /api/fleets
 * @access  Public
 */
const getFleets = async (req, res, next) => {
  try {
    const fleets = await Fleet.find()
      .populate('vehicles')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: fleets.length,
      data: fleets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single fleet by ID with populated vehicles
 * @route   GET /api/fleets/:id
 * @access  Public
 */
const getFleet = async (req, res, next) => {
  try {
    const fleet = await Fleet.findById(req.params.id).populate('vehicles');

    if (!fleet) {
      return next(new AppError(`Fleet with ID ${req.params.id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: fleet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFleet,
  getFleets,
  getFleet,
};
