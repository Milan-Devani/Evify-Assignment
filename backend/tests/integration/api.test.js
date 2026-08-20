const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const { Fleet, Vehicle } = require('../../src/models');
const { connectTestDB, clearTestDB, closeTestDB } = require('../setup');

describe('Integration Tests: Evify Fleet Management API', () => {
  let authToken;
  let testFleet;

  beforeAll(async () => {
    await connectTestDB();

    // Generate valid JWT token for protected routes
    const secret =
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_evify_fleet_management_2026';
    authToken = jwt.sign(
      { userId: 'test_admin_id', email: 'admin@evify.com', role: 'admin' },
      secret,
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create a base test fleet for vehicle tests
    testFleet = await Fleet.create({
      name: 'Downtown Fleet',
      description: 'Downtown EV fleet for tests',
    });
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // ==========================================
  // Health & Root Endpoints
  // ==========================================
  describe('GET /health & GET /', () => {
    it('should return 200 OK with server health info', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });

    it('should return 200 with API metadata on root endpoint', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toContain('Evify Fleet Management API');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  // ==========================================
  // Auth Endpoint
  // ==========================================
  describe('POST /api/auth/login', () => {
    it('should successfully log in with valid demo credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@evify.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('admin@evify.com');
    });

    it('should fail with 401 when given incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@evify.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid email or password');
    });
  });

  // ==========================================
  // Fleets Endpoints
  // ==========================================
  describe('Fleets API', () => {
    it('POST /api/fleets should create a new fleet', async () => {
      const res = await request(app).post('/api/fleets').send({
        name: 'Airport Express Fleet',
        description: 'Transfers to airport',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Airport Express Fleet');
    });

    it('GET /api/fleets should return all fleets', async () => {
      await Fleet.create({ name: 'Residential Fleet' });

      const res = await request(app).get('/api/fleets');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2); // testFleet + Residential
    });
  });

  // ==========================================
  // Vehicles Endpoints
  // ==========================================
  describe('Vehicles API', () => {
    let createdVehicleId;

    describe('POST /api/vehicles', () => {
      it('should successfully create vehicle with valid data', async () => {
        const vehicleData = {
          registrationNumber: 'EV-INT-001',
          model: 'Tesla Model 3',
          status: 'active',
          fleet: testFleet._id.toString(),
          batteryLevel: 90,
          notes: 'Brand new vehicle',
        };

        const res = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${authToken}`)
          .send(vehicleData);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.registrationNumber).toBe('EV-INT-001');
        expect(res.body.data.fleet.name).toBe('Downtown Fleet');

        createdVehicleId = res.body.data._id;
      });

      it('should fail with duplicate registration number (400)', async () => {
        await Vehicle.create({
          registrationNumber: 'EV-DUP-999',
          model: 'Chevy Bolt',
          fleet: testFleet._id,
        });

        const res = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            registrationNumber: 'EV-DUP-999',
            model: 'Another Model',
            fleet: testFleet._id.toString(),
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('already exists');
      });

      it('should fail with invalid fleet ID (404)', async () => {
        const nonExistentFleetId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            registrationNumber: 'EV-NONEXIST',
            model: 'Nissan Leaf',
            fleet: nonExistentFleetId,
          });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('does not exist');
      });

      it('should fail with 401 if unauthorized (no token)', async () => {
        const res = await request(app).post('/api/vehicles').send({
          registrationNumber: 'EV-UNAUTH',
          model: 'Nissan Leaf',
          fleet: testFleet._id.toString(),
        });

        expect(res.statusCode).toBe(401);
      });
    });

    describe('GET /api/vehicles', () => {
      beforeEach(async () => {
        const otherFleet = await Fleet.create({ name: 'Suburban Fleet' });

        await Vehicle.create([
          {
            registrationNumber: 'EV-LIST-1',
            model: 'Model A',
            status: 'active',
            fleet: testFleet._id,
            batteryLevel: 80,
          },
          {
            registrationNumber: 'EV-LIST-2',
            model: 'Model B',
            status: 'charging',
            fleet: testFleet._id,
            batteryLevel: 50,
          },
          {
            registrationNumber: 'EV-LIST-3',
            model: 'Model C',
            status: 'maintenance',
            fleet: otherFleet._id,
            batteryLevel: 20,
          },
        ]);
      });

      it('should get all vehicles with pagination metadata', async () => {
        const res = await request(app).get('/api/vehicles?page=1&limit=2');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.total).toBe(3);
        expect(res.body.pagination.pages).toBe(2);
        expect(res.body.pagination.page).toBe(1);
      });

      it('should filter vehicles by fleet', async () => {
        const res = await request(app).get(`/api/vehicles?fleet=${testFleet._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(2);
        res.body.data.forEach((v) => {
          expect(v.fleet._id.toString()).toBe(testFleet._id.toString());
        });
      });

      it('should filter vehicles by status', async () => {
        const res = await request(app).get('/api/vehicles?status=charging');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].status).toBe('charging');
      });
    });

    describe('GET /api/vehicles/:id', () => {
      it('should get existing vehicle by ID with populated fleet', async () => {
        const vehicle = await Vehicle.create({
          registrationNumber: 'EV-GET-ID',
          model: 'Polestar 2',
          fleet: testFleet._id,
        });

        const res = await request(app).get(`/api/vehicles/${vehicle._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.registrationNumber).toBe('EV-GET-ID');
        expect(res.body.data.fleet.name).toBe('Downtown Fleet');
      });

      it('should return 404 for non-existent vehicle ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/vehicles/${fakeId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
      });
    });

    describe('PUT /api/vehicles/:id', () => {
      it('should update existing vehicle', async () => {
        const vehicle = await Vehicle.create({
          registrationNumber: 'EV-UPDATE-01',
          model: 'Kia EV6',
          status: 'active',
          fleet: testFleet._id,
          batteryLevel: 70,
        });

        const res = await request(app)
          .put(`/api/vehicles/${vehicle._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            batteryLevel: 95,
            status: 'charging',
            notes: 'Fast charged to 95%',
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.batteryLevel).toBe(95);
        expect(res.body.data.status).toBe('charging');
      });

      it('should return 404 for non-existent vehicle ID on update', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
          .put(`/api/vehicles/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ model: 'Ghost Car' });

        expect(res.statusCode).toBe(404);
      });

      it('should prevent updating to an already existing registration number', async () => {
        await Vehicle.create({
          registrationNumber: 'EV-EXISTING-REG',
          model: 'Model 1',
          fleet: testFleet._id,
        });

        const vehicleToUpdate = await Vehicle.create({
          registrationNumber: 'EV-TO-CHANGE',
          model: 'Model 2',
          fleet: testFleet._id,
        });

        const res = await request(app)
          .put(`/api/vehicles/${vehicleToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ registrationNumber: 'EV-EXISTING-REG' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('already exists');
      });
    });

    describe('DELETE /api/vehicles/:id', () => {
      it('should delete existing vehicle', async () => {
        const vehicle = await Vehicle.create({
          registrationNumber: 'EV-DEL-01',
          model: 'Audi e-tron',
          fleet: testFleet._id,
        });

        const res = await request(app)
          .delete(`/api/vehicles/${vehicle._id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('deleted successfully');

        const checkInDb = await Vehicle.findById(vehicle._id);
        expect(checkInDb).toBeNull();
      });

      it('should return 404 for non-existent vehicle on delete', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
          .delete(`/api/vehicles/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(404);
      });
    });
  });
});
