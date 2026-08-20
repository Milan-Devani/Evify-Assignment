const mongoose = require('mongoose');
const { Fleet, Vehicle } = require('../../src/models');
const { connectTestDB, clearTestDB, closeTestDB } = require('../setup');

describe('Unit Tests: Mongoose Models', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('Fleet Model', () => {
    it('should successfully create a valid fleet', async () => {
      const fleetData = {
        name: 'Downtown Express Fleet',
        description: 'Rapid transit EVs',
      };
      const fleet = new Fleet(fleetData);
      const savedFleet = await fleet.save();

      expect(savedFleet._id).toBeDefined();
      expect(savedFleet.name).toBe(fleetData.name);
      expect(savedFleet.description).toBe(fleetData.description);
      expect(savedFleet.createdAt).toBeDefined();
    });

    it('should fail validation if name is missing', async () => {
      const fleet = new Fleet({ description: 'No name fleet' });
      let err;
      try {
        await fleet.validate();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
    });

    it('should fail validation if name exceeds 50 characters', async () => {
      const fleet = new Fleet({
        name: 'A'.repeat(51),
      });
      let err;
      try {
        await fleet.validate();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
    });
  });

  describe('Vehicle Model', () => {
    let testFleet;

    beforeEach(async () => {
      testFleet = await Fleet.create({
        name: 'Metro Fleet',
        description: 'Test fleet for vehicle unit tests',
      });
    });

    it('should successfully create a valid vehicle and uppercase registrationNumber in pre-save', async () => {
      const vehicle = new Vehicle({
        registrationNumber: 'ev-test-101',
        model: 'Tesla Model Y',
        status: 'active',
        fleet: testFleet._id,
        batteryLevel: 80,
      });

      const savedVehicle = await vehicle.save();
      expect(savedVehicle._id).toBeDefined();
      expect(savedVehicle.registrationNumber).toBe('EV-TEST-101');
      expect(savedVehicle.batteryLevel).toBe(80);
      expect(savedVehicle.status).toBe('active');
    });

    it('should fail validation if registrationNumber contains invalid characters', async () => {
      const vehicle = new Vehicle({
        registrationNumber: 'EV@#$123',
        model: 'Tesla Model Y',
        fleet: testFleet._id,
      });

      let err;
      try {
        await vehicle.validate();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.errors.registrationNumber).toBeDefined();
    });

    it('should fail validation if status is invalid enum value', async () => {
      const vehicle = new Vehicle({
        registrationNumber: 'EV-100',
        model: 'Tesla Model Y',
        status: 'flying',
        fleet: testFleet._id,
      });

      let err;
      try {
        await vehicle.validate();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.errors.status).toBeDefined();
    });

    it('should fail validation if battery level is out of bounds (<0 or >100)', async () => {
      const vehicleLow = new Vehicle({
        registrationNumber: 'EV-LOW',
        model: 'Tesla Model Y',
        batteryLevel: -5,
        fleet: testFleet._id,
      });

      let errLow;
      try {
        await vehicleLow.validate();
      } catch (error) {
        errLow = error;
      }
      expect(errLow).toBeDefined();
      expect(errLow.errors.batteryLevel).toBeDefined();

      const vehicleHigh = new Vehicle({
        registrationNumber: 'EV-HIGH',
        model: 'Tesla Model Y',
        batteryLevel: 150,
        fleet: testFleet._id,
      });

      let errHigh;
      try {
        await vehicleHigh.validate();
      } catch (error) {
        errHigh = error;
      }
      expect(errHigh).toBeDefined();
      expect(errHigh.errors.batteryLevel).toBeDefined();
    });

    it('should populate virtual vehicles field on Fleet model', async () => {
      await Vehicle.create({
        registrationNumber: 'EV-VIRT-01',
        model: 'Nissan Leaf',
        fleet: testFleet._id,
      });

      const populatedFleet = await Fleet.findById(testFleet._id).populate('vehicles');
      expect(populatedFleet.vehicles).toHaveLength(1);
      expect(populatedFleet.vehicles[0].registrationNumber).toBe('EV-VIRT-01');
    });
  });
});
