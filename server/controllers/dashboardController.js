const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const [totalVehicles, activeVehicles, totalRoutes, totalSchedules] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'on-route' }),
      Route.countDocuments(),
      Schedule.countDocuments(),
    ]);

    res.json({ totalVehicles, activeVehicles, totalRoutes, totalSchedules });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
