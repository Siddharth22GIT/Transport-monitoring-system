const Vehicle = require('../models/Vehicle');
const { pointAtFraction, totalPathLengthKm } = require('../utils/geo');

const TICK_MS = 800; // how often we move the vehicle and broadcast
const PROGRESS_PER_TICK = 0.008; // ~2 minutes to complete a full route, in small smooth steps

let ioRef = null;
const activeTimers = new Map(); // vehicleId (string) -> setInterval handle

const setIo = (io) => {
  ioRef = io;
};

const stopSimulation = (vehicleId) => {
  const key = String(vehicleId);
  const timer = activeTimers.get(key);
  if (timer) {
    clearInterval(timer);
    activeTimers.delete(key);
  }
};

// Starts (or resumes) moving `vehicle` along `route.stops`. Emits a
// 'broadcastLocation' event on every tick with a small incremental move,
// never a large jump - this is what makes the map marker glide instead
// of teleport.
const startSimulation = (vehicle, route) => {
  if (!ioRef) return;
  if (!route || !route.stops || route.stops.length < 2) return;

  stopSimulation(vehicle._id); // avoid double intervals if already running

  const path = route.stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  const totalKm = totalPathLengthKm(path);
  const key = String(vehicle._id);

  const timer = setInterval(async () => {
    try {
      const fresh = await Vehicle.findById(vehicle._id);
      if (!fresh || fresh.status !== 'running') {
        stopSimulation(vehicle._id);
        return;
      }

      const nextProgress = Math.min(1, (fresh.routeProgress || 0) + PROGRESS_PER_TICK);
      const point = pointAtFraction(path, nextProgress);
      const kmThisTick = totalKm * PROGRESS_PER_TICK;
      const impliedSpeedKmh = Math.round((kmThisTick / (TICK_MS / 3600000)) * 100) / 100;

      fresh.currentLocation = { type: 'Point', coordinates: [point.lng, point.lat] };
      fresh.routeProgress = nextProgress;
      fresh.speed = nextProgress >= 1 ? 0 : Math.min(60, impliedSpeedKmh); // cap displayed speed for realism
      fresh.lastUpdated = new Date();
      if (nextProgress >= 1) fresh.status = 'completed';
      await fresh.save();

      ioRef.emit('broadcastLocation', {
        vehicleId: fresh.vehicleNumber,
        latitude: point.lat,
        longitude: point.lng,
        speed: fresh.speed,
        routeProgress: nextProgress,
        status: fresh.status,
        timestamp: Date.now(),
      });

      if (nextProgress >= 1) stopSimulation(vehicle._id);
    } catch (err) {
      console.error('Simulation tick error:', err.message);
      stopSimulation(vehicle._id);
    }
  }, TICK_MS);

  activeTimers.set(key, timer);
};

module.exports = { setIo, startSimulation, stopSimulation };
