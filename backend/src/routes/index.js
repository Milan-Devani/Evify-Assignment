const express = require('express');
const vehicleRoutes = require('./vehicleRoutes');
const fleetRoutes = require('./fleetRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/vehicles', vehicleRoutes);
router.use('/fleets', fleetRoutes);
router.use('/auth', authRoutes);

module.exports = router;
