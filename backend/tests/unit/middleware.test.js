const jwt = require('jsonwebtoken');
const { AppError, errorHandler, validate, authenticate } = require('../../src/middleware');

describe('Unit Tests: Middleware', () => {
  describe('AppError', () => {
    it('should create an operational error with proper status code and status flag', () => {
      const err400 = new AppError('Bad Request error message', 400);
      expect(err400.message).toBe('Bad Request error message');
      expect(err400.statusCode).toBe(400);
      expect(err400.status).toBe('fail');
      expect(err400.isOperational).toBe(true);

      const err500 = new AppError('Server error', 500);
      expect(err500.statusCode).toBe(500);
      expect(err500.status).toBe('error');
    });
  });

  describe('errorHandler Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      mockReq = {
        method: 'GET',
        originalUrl: '/api/test',
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should handle Mongoose CastError properly (400 Bad Request)', () => {
      const castError = {
        name: 'CastError',
        path: '_id',
        value: 'invalid_id_123',
      };

      errorHandler(castError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 400,
          error: 'Invalid _id: invalid_id_123',
        })
      );
    });

    it('should handle Mongoose Duplicate Key Error (code 11000)', () => {
      const dupError = {
        code: 11000,
        keyValue: { registrationNumber: 'EV-DUP-01' },
      };

      errorHandler(dupError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 400,
          error: expect.stringContaining('Duplicate value: "EV-DUP-01"'),
        })
      );
    });

    it('should handle Mongoose ValidationError properly', () => {
      const validationError = {
        name: 'ValidationError',
        errors: {
          name: { message: 'Fleet name is required' },
          model: { message: 'Vehicle model is required' },
        },
      };

      errorHandler(validationError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 400,
          error: expect.stringContaining('Invalid input data'),
        })
      );
    });

    it('should handle JsonWebTokenError (401)', () => {
      const jwtError = { name: 'JsonWebTokenError' };

      errorHandler(jwtError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 401,
          error: 'Invalid token. Please log in again.',
        })
      );
    });
  });

  describe('auth Middleware', () => {
    it('should reject request when Authorization header is missing', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const errorArg = next.mock.calls[0][0];
      expect(errorArg.statusCode).toBe(401);
      expect(errorArg.message).toContain('No token provided');
    });

    it('should accept valid Bearer token and attach user to req', () => {
      const token = jwt.sign(
        { userId: 'usr_123', email: 'test@evify.com' },
        process.env.JWT_SECRET || 'super_secret_jwt_key_for_evify_fleet_management_2026'
      );

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@evify.com');
    });
  });
});
