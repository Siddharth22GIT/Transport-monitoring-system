const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

// Distinct, high-contrast colors so multiple routes are visually distinguishable on the map
const ROUTE_COLORS = ['#2563eb', '#e11d48', '#059669', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    stops: { type: [stopSchema], default: [] },
    distance: { type: Number, default: 0 },
    color: { type: String, default: '#2563eb' },
  },
  { timestamps: true }
);

routeSchema.statics.ROUTE_COLORS = ROUTE_COLORS;

module.exports = mongoose.model('Route', routeSchema);
