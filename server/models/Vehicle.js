const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['bus', 'train'], default: 'bus' },
    capacity: { type: Number, default: 0 },
    driverName: { type: String, default: '' },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    // idle: not moving. running: actively simulating along its route. completed: finished the route.
    status: { type: String, enum: ['idle', 'running', 'completed', 'maintenance'], default: 'idle' },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    // Fraction of the current leg completed (0 to 1), lets a run resume/redraw consistently
    routeProgress: { type: Number, default: 0 },
    // 1 = start->end, -1 = end->start. Flips automatically when a leg finishes,
    // so the bus reroutes back along the same path instead of just stopping.
    routeDirection: { type: Number, enum: [1, -1], default: 1 },
    speed: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

vehicleSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Vehicle', vehicleSchema);