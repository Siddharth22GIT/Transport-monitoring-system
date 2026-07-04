// Checks every minute for scheduled departures and auto-starts the matching
// vehicle - the admin no longer has to manually click Start. Recurring
// daysOfWeek takes priority over a one-off date (per the requested design):
// if a schedule has daysOfWeek set, that's what governs it every week; the
// date field only matters for schedules with no daysOfWeek at all.
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const simulator = require('./simulator');

const CHECK_INTERVAL_MS = 60 * 1000; // once a minute is enough granularity for a departure time
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n) => String(n).padStart(2, '0');

const isDueNow = (schedule, now) => {
  const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  if (schedule.departureTime !== hhmm) return false;

  if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
    return schedule.daysOfWeek.includes(DAY_ABBR[now.getDay()]);
  }
  if (schedule.date) {
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return schedule.date === todayStr;
  }
  return false;
};

const checkSchedules = async () => {
  try {
    const now = new Date();
    const schedules = await Schedule.find();

    for (const schedule of schedules) {
      if (!isDueNow(schedule, now)) continue;

      const vehicle = await Vehicle.findById(schedule.vehicleId);
      if (!vehicle || vehicle.status === 'running') continue; // already on the road or deleted

      const route = await Route.findById(schedule.routeId);
      if (!route || !route.stops || route.stops.length < 2) continue;

      vehicle.routeProgress = 0;
      vehicle.routeDirection = 1;
      vehicle.status = 'running';
      await vehicle.save();
      simulator.startSimulation(vehicle, route);
      console.log(`Auto-started ${vehicle.vehicleNumber} for its ${schedule.departureTime} departure`);
    }
  } catch (err) {
    console.error('Schedule check error:', err.message);
  }
};

let intervalHandle = null;
const start = () => {
  if (intervalHandle) return; // don't double-schedule if start() is called twice
  checkSchedules(); // also check immediately at boot, in case a departure was missed while the server was down
  intervalHandle = setInterval(checkSchedules, CHECK_INTERVAL_MS);
};

module.exports = { start };