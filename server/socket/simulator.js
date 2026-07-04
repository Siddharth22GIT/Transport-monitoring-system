const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const { pointAtFraction, totalPathLengthKm } = require('../utils/geo');

const TICK_MS = 1000;
const DEFAULT_SPEED_KMH = 30;
const MIN_DURATION_MIN = 1;

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

const resolveDurationMinutes = (route, totalKm) => {
  if (route.durationMin && route.durationMin > 0) return route.durationMin;
  if (totalKm > 0) return (totalKm / DEFAULT_SPEED_KMH) * 60;
  return 10;
};

// Starts (or resumes) moving `vehicle` along `route.stops` at the route's
// real travel time. When it reaches the end, it automatically reroutes -
// flips direction and drives back along the same path - so a bus keeps
// running its route continuously instead of stopping dead once and
// requiring the admin to manually restart it every time.
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

      let nextProgress = (fresh.routeProgress || 0) + progressPerTick;
      let direction = fresh.routeDirection || 1;
      let rerouted = false;

      if (nextProgress >= 1) {
        // Reached the end of this leg - reroute: flip direction and
        // continue from the start of the reversed leg rather than stopping.
        nextProgress = 0;
        direction = direction === 1 ? -1 : 1;
        rerouted = true;
      }

      const displayedFraction = direction === 1 ? nextProgress : 1 - nextProgress;
      const point = pointAtFraction(path, displayedFraction);
      const impliedSpeedKmh = totalKm > 0 ? Math.round((totalKm / durationMin) * 60 * 10) / 10 : 0;

      fresh.currentLocation = { type: 'Point', coordinates: [point.lng, point.lat] };
      fresh.routeProgress = nextProgress;
      fresh.routeDirection = direction;
      fresh.speed = impliedSpeedKmh;
      fresh.lastUpdated = new Date();
      await fresh.save();

      ioRef.emit('broadcastLocation', {
        vehicleId: fresh.vehicleNumber,
        latitude: point.lat,
        longitude: point.lng,
        speed: fresh.speed,
        routeProgress: nextProgress,
        routeDirection: direction,
        rerouted,
        status: fresh.status,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Simulation tick error:', err.message);
      stopSimulation(vehicle._id);
    }
  }, TICK_MS);

  activeTimers.set(key, timer);
};

// Called once at server boot. If the process restarted (free-tier
// spin-down, crash, deploy) while a bus was mid-route, its DB status is
// still 'running' but nothing is actually driving it anymore - this
// resumes those from wherever routeProgress left off.
const resumeInFlightVehicles = async () => {
  if (!ioRef) return;
  const running = await Vehicle.find({ status: 'running' });
  for (const vehicle of running) {
    if (!vehicle.routeId) continue;
    const route = await Route.findById(vehicle.routeId);
    if (route) startSimulation(vehicle, route);
  }
};

module.exports = { setIo, startSimulation, stopSimulation, resumeInFlightVehicles };