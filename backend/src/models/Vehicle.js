const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Registration number cannot exceed 20 characters'],
      match: [
        /^[A-Z0-9-]+$/,
        'Registration number must contain only uppercase letters, numbers, and dashes',
      ],
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
      maxlength: [100, 'Model name cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'charging', 'maintenance', 'inactive'],
        message: '{VALUE} is not a valid status (active, charging, maintenance, inactive)',
      },
      default: 'active',
      trim: true,
    },
    fleet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fleet',
      required: [true, 'Fleet reference is required'],
    },
    batteryLevel: {
      type: Number,
      default: 100,
      min: [0, 'Battery level cannot be less than 0'],
      max: [100, 'Battery level cannot exceed 100'],
    },
    lastMaintenance: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index on fleet and status for query performance
vehicleSchema.index({ fleet: 1, status: 1 });

// Pre-save middleware to uppercase registrationNumber and trim fields
vehicleSchema.pre('save', function (next) {
  if (this.registrationNumber) {
    this.registrationNumber = this.registrationNumber.trim().toUpperCase();
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
