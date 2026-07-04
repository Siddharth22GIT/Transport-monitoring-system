const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const simulator = require('../socket/simulator');

// GET /api/vehicles
const listVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate('routeId', 'name color startLocation endLocation stops');
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles/:id
const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('routeId');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// POST /api/vehicles
const createVehicle = async (req, res, next) => {
  try {
    const { vehicleNumber, type, capacity, driverName, routeId } = req.body;
    if (!vehicleNumber) {
      return res.status(400).json({ message: 'vehicleNumber is required' });
    }
    const vehicle = await Vehicle.create({ vehicleNumber, type, capacity, driverName, routeId });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Vehicle number already exists' });
    }
    next(err);
  }
};

// PUT /api/vehicles/:id
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vehicles/:id
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicles/nearby?lat=...&lng=...&maxDistance=2000 (meters)
const nearbyVehicles = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 2000 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query params are required' });
    }
    const vehicles = await Vehicle.find({
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance, 10),
        },
      },
    });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// PUT /api/vehicles/:id/status  { status: 'running' | 'idle' | 'maintenance' }
// This is the ONLY way a vehicle's position starts moving - admin must
// explicitly set it to running, and only after a route is assigned.
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['running', 'idle', 'maintenance', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (status === 'running') {
      if (!vehicle.routeId) {
        return res.status(400).json({ message: 'Assign a route to this vehicle before starting it' });
      }
      const route = await Route.findById(vehicle.routeId);
      if (!route || route.stops.length < 2) {
        return res.status(400).json({ message: 'Route needs at least a start and end location' });
      }
      // Always start a fresh run from the beginning, forward direction -
      // the simulator itself now handles auto-reroute (reverse) once a
      // route finishes, so "Start" should never resume mid-reverse-leg.
      vehicle.routeProgress = 0;
      vehicle.routeDirection = 1;
      vehicle.status = 'running';
      await vehicle.save();
      simulator.startSimulation(vehicle, route);
    } else {
      simulator.stopSimulation(vehicle._id);
      vehicle.status = status;
      if (status === 'idle') {
        vehicle.routeProgress = 0;
        vehicle.routeDirection = 1;
      }
      await vehicle.save();
    }

    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  nearbyVehicles,
  updateStatus,
};