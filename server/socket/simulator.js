const Vehicle = require('../models/Vehicle');
const { pointAtFraction, totalPathLengthKm } = require('../utils/geo');

const TICK_MS = 1000;
const DEFAULT_SPEED_KMH = 30;
const MIN_DURATION_MIN = 1;

let ioRef = null;
const activeTimers = new Map();

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

const resolveDurationMinutes = (route, totalKm) => {
  if (route.durationMin && route.durationMin > 0) return route.durationMin;
  if (totalKm > 0) return (totalKm / DEFAULT_SPEED_KMH) * 60;
  return 10;
};

const startSimulation = (vehicle, route) => {
  if (!ioRef) return;
  if (!route || !route.stops || route.stops.length < 2) return;

  stopSimulation(vehicle._id);

  const path = route.stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  const totalKm = totalPathLengthKm(path);
  const durationMin = Math.max(MIN_DURATION_MIN, resolveDurationMinutes(route, totalKm));
  const totalMs = durationMin * 60 * 1000;
  const progressPerTick = TICK_MS / totalMs;
  const key = String(vehicle._id);

  const timer = setInterval(async () => {
    try {
      const fresh = await Vehicle.findById(vehicle._id);
      if (!fresh || fresh.status !== 'running') {
        stopSimulation(vehicle._id);
        return;
      }

      const nextProgress = Math.min(1, (fresh.routeProgress || 0) + progressPerTick);
      const point = pointAtFraction(path, nextProgress);
      const impliedSpeedKmh = totalKm > 0 ? Math.round((totalKm / durationMin) * 60 * 10) / 10 : 0;

      fresh.currentLocation = { type: 'Point', coordinates: [point.lng, point.lat] };
      fresh.routeProgress = nextProgress;
      fresh.speed = nextProgress >= 1 ? 0 : impliedSpeedKmh;
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

// Called once at server boot. If the process restarted (Render free-tier
// spin-down, crash, deploy) while a bus was mid-route, its DB status is
// still 'running' but no interval is actually driving it anymore - this
// resumes those from wherever routeProgress left off instead of leaving
// them stuck.
const resumeInFlightVehicles = async () => {
  if (!ioRef) return;
  const Route = require('../models/Route');
  const running = await Vehicle.find({ status: 'running' });
  for (const vehicle of running) {
    if (!vehicle.routeId) continue;
    const route = await Route.findById(vehicle.routeId);
    if (route) startSimulation(vehicle, route);
  }
};

module.exports = { setIo, startSimulation, stopSimulation, resumeInFlightVehicles };