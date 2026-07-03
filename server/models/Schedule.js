const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: String, required: true }, // "08:00"
    arrivalTime: { type: String, required: true }, // "09:15"
    date: { type: String, default: '' }, // optional "YYYY-MM-DD" for a specific run
    daysOfWeek: { type: [String], default: [] }, // ["Mon","Tue",...]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
