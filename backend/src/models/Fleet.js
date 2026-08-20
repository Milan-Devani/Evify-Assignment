const mongoose = require('mongoose');

const fleetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fleet name is required'],
      trim: true,
      maxlength: [50, 'Fleet name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to populate vehicles belonging to this fleet
fleetSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'fleet',
});

const Fleet = mongoose.model('Fleet', fleetSchema);

module.exports = Fleet;
