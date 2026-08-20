const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const logger = require('../config/logger');
const { Fleet, Vehicle } = require('../models');

const sampleFleets = [
  {
    name: 'Downtown Fleet',
    description: 'Electric vehicles serving the central business district and downtown core.',
  },
  {
    name: 'Airport Fleet',
    description: 'High-range EVs dedicated to airport shuttle and passenger transfers.',
  },
  {
    name: 'Residential Fleet',
    description: 'Neighborhood electric utility and on-demand suburban transit vehicles.',
  },
];

const sampleVehicles = [
  {
    registrationNumber: 'EV-DOWNTOWN-01',
    model: 'Tesla Model 3 Long Range',
    status: 'active',
    batteryLevel: 88,
    notes: 'Recently washed and inspected. Operating smoothly.',
  },
  {
    registrationNumber: 'EV-AIRPORT-02',
    model: 'Hyundai Ioniq 5 AWD',
    status: 'charging',
    batteryLevel: 45,
    notes: 'Plugged in at Terminal 2 Supercharger.',
  },
  {
    registrationNumber: 'EV-RESIDENT-03',
    model: 'Nissan Leaf Plus',
    status: 'maintenance',
    batteryLevel: 22,
    notes: 'Scheduled for routine tire rotation and brake pad inspection.',
  },
  {
    registrationNumber: 'EV-DOWNTOWN-04',
    model: 'Ford Mustang Mach-E',
    status: 'active',
    batteryLevel: 94,
    notes: 'Assigned to corporate VIP shuttle duties.',
  },
  {
    registrationNumber: 'EV-AIRPORT-05',
    model: 'Chevrolet Bolt EV',
    status: 'inactive',
    batteryLevel: 15,
    notes: 'Awaiting overnight depot fast-charging slot.',
  },
];

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database for seeding...');
    await connectDB();

    logger.info('Clearing existing Fleet and Vehicle collections...');
    await Vehicle.deleteMany({});
    await Fleet.deleteMany({});

    logger.info('Inserting 3 initial fleets...');
    const createdFleets = await Fleet.insertMany(sampleFleets);
    logger.info(`Successfully created ${createdFleets.length} fleets.`);

    logger.info('Assigning vehicles to fleets in round-robin distribution...');
    const vehiclesWithFleets = sampleVehicles.map((vehicle, index) => {
      const assignedFleet = createdFleets[index % createdFleets.length];
      return {
        ...vehicle,
        fleet: assignedFleet._id,
        lastMaintenance: new Date(Date.now() - index * 86400000 * 3), // staggered dates
      };
    });

    const createdVehicles = await Vehicle.insertMany(vehiclesWithFleets);
    logger.info(`Successfully created ${createdVehicles.length} vehicles.`);

    logger.info('--- Database Seeding Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during database seeding: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
};

// Run seed script if invoked directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
