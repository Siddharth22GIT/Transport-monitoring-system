const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Schedule = require('../models/Schedule');

const listRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    next(err);
  }
};

const getRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    next(err);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const { name, startLocation, endLocation, stops, distance, durationMin } = req.body;
    if (!name || !startLocation || !endLocation || !stops || stops.length < 2) {
      return res.status(400).json({ message: 'name, startLocation, endLocation and at least 2 stops (start+end) are required' });
    }

    const existingCount = await Route.countDocuments();
    const color = Route.ROUTE_COLORS[existingCount % Route.ROUTE_COLORS.length];

    const route = await Route.create({ name, startLocation, endLocation, stops, distance, durationMin, color });
    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    next(err);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    // Unassign any vehicles that were on this route
    await Vehicle.updateMany({ routeId: route._id }, { routeId: null, status: 'idle', routeProgress: 0 });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/routes/search?from=...&to=...&date=YYYY-MM-DD (date optional)
// Matches routes by case-insensitive substring on start/end location, then
// returns one card per vehicle assigned to a matching route (with its
// schedule if one exists), which is what the passenger search UI needs.
const searchRoutes = async (req, res, next) => {
  try {
    const { from = '', to = '', date = '' } = req.query;
    if (!from.trim() || !to.trim()) {
      return res.status(400).json({ message: 'from and to are required' });
    }

    const routes = await Route.find({
      startLocation: { $regex: from.trim(), $options: 'i' },
      endLocation: { $regex: to.trim(), $options: 'i' },
    });

    if (routes.length === 0) return res.json([]);

    const routeIds = routes.map((r) => r._id);
    const vehicles = await Vehicle.find({ routeId: { $in: routeIds } });
    const schedules = await Schedule.find({ routeId: { $in: routeIds } });

    const results = vehicles.map((vehicle) => {
      const route = routes.find((r) => String(r._id) === String(vehicle.routeId));
      let matchingSchedules = schedules.filter((s) => String(s.routeId) === String(vehicle.routeId) && String(s.vehicleId) === String(vehicle._id));
      if (date) matchingSchedules = matchingSchedules.filter((s) => !s.date || s.date === date);
      return {
        route,
        vehicle,
        schedule: matchingSchedules[0] || null,
      };
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

module.exports = { listRoutes, getRoute, createRoute, updateRoute, deleteRoute, searchRoutes };