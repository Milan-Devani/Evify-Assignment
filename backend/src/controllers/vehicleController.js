const { Vehicle, Fleet } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * @desc    Create a new vehicle
 * @route   POST /api/vehicles
 * @access  Protected
 */
const createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, model, status, fleet, batteryLevel, lastMaintenance, notes } =
      req.body;

    // Validate fleet existence
    const fleetExists = await Fleet.findById(fleet);
    if (!fleetExists) {
      return next(new AppError(`Fleet with ID ${fleet} does not exist`, 404));
    }

    // Check for duplicate registrationNumber
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase(),
    });
    if (existingVehicle) {
      return next(
        new AppError(
          `Vehicle with registration number "${registrationNumber.toUpperCase()}" already exists`,
          400
        )
      );
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      model,
      status,
      fleet,
      batteryLevel,
      lastMaintenance,
      notes,
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate('fleet', 'name description');

    logger.info(`Vehicle created: ${vehicle.registrationNumber} (ID: ${vehicle._id})`);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: populatedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all vehicles with filtering and pagination
 * @route   GET /api/vehicles
 * @access  Public
 */
const getVehicles = async (req, res, next) => {
  try {
    // Build query filter
    const queryFilter = {};

    if (req.query.fleet) {
      queryFilter.fleet = req.query.fleet;
    }

    if (req.query.status) {
      queryFilter.status = req.query.status;
    }

    // Pagination setup
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const total = await Vehicle.countDocuments(queryFilter);
    const totalPages = Math.ceil(total / limit) || 1;

    const vehicles = await Vehicle.find(queryFilter)
      .populate('fleet', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('fleet', 'name description');

    if (!vehicle) {
      return next(new AppError(`Vehicle with ID ${req.params.id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vehicle by ID
 * @route   PUT /api/vehicles/:id
 * @access  Protected
 */
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError(`Vehicle with ID ${req.params.id} not found`, 404));
    }

    // Validate fleet if updated
    if (req.body.fleet) {
      const fleetExists = await Fleet.findById(req.body.fleet);
      if (!fleetExists) {
        return next(new AppError(`Fleet with ID ${req.body.fleet} does not exist`, 404));
      }
    }

    // Check registration number uniqueness if changing
    if (
      req.body.registrationNumber &&
      req.body.registrationNumber.trim().toUpperCase() !== vehicle.registrationNumber
    ) {
      const duplicate = await Vehicle.findOne({
        registrationNumber: req.body.registrationNumber.trim().toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (duplicate) {
        return next(
          new AppError(
            `Vehicle with registration number "${req.body.registrationNumber.toUpperCase()}" already exists`,
            400
          )
        );
      }
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('fleet', 'name description');

    logger.info(`Vehicle updated: ${updatedVehicle.registrationNumber} (ID: ${updatedVehicle._id})`);

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete vehicle by ID
 * @route   DELETE /api/vehicles/:id
 * @access  Protected
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError(`Vehicle with ID ${req.params.id} not found`, 404));
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    logger.info(`Vehicle deleted: ${vehicle.registrationNumber} (ID: ${vehicle._id})`);

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
