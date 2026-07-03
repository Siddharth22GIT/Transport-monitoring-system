// Populates the DB with a demo admin user, passenger, two routes, and two
// vehicles so you can log in and try the full flow immediately.
//
// Route paths are fetched from OSRM's public routing API so they actually
// follow real roads (not straight lines through rivers/buildings). If that
// request fails (e.g. no internet at seed time), we fall back to a straight
// line between the two points - everything still works, just less pretty.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Schedule = require('../models/Schedule');

const fetchRoadPath = async (start, end) => {
  try {
    const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM request failed');
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) throw new Error('No route found');
    const points = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    return { points, distanceKm: Math.round((route.distance / 1000) * 10) / 10 };
  } catch (err) {
    console.warn(`  (couldn't fetch road path, using a straight line: ${err.message})`);
    return { points: [start, end], distanceKm: 0 };
  }
};

const buildStops = (points, startName, endName) =>
  points.map((p, i) => ({
    name: i === 0 ? startName : i === points.length - 1 ? endName : '',
    lat: p.lat,
    lng: p.lng,
  }));

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Promise.all([
    User.deleteMany({}),
    Route.deleteMany({}),
    Vehicle.deleteMany({}),
    Schedule.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await User.create({ name: 'Admin', email: 'admin@wheresmybus.test', passwordHash, role: 'admin' });
  await User.create({
    name: 'Riya Passenger',
    email: 'riya@wheresmybus.test',
    passwordHash: await bcrypt.hash('Passenger123!', 10),
    role: 'passenger',
  });

  console.log('Fetching real road paths from OSRM (this may take a few seconds)...');

  const routeAStart = { lat: 28.6315, lng: 77.2167 }; // Connaught Place
  const routeAEnd = { lat: 28.5521, lng: 77.0589 }; // Dwarka Sector 21
  const roadA = await fetchRoadPath(routeAStart, routeAEnd);

  const routeBStart = { lat: 28.6519, lng: 77.1909 }; // Karol Bagh
  const routeBEnd = { lat: 28.5245, lng: 77.2066 }; // Saket
  const roadB = await fetchRoadPath(routeBStart, routeBEnd);

  const routeA = await Route.create({
    name: 'Route 12 - Connaught Place to Dwarka',
    startLocation: 'Connaught Place',
    endLocation: 'Dwarka Sector 21',
    distance: roadA.distanceKm,
    color: Route.ROUTE_COLORS[0],
    stops: buildStops(roadA.points, 'Connaught Place', 'Dwarka Sector 21'),
  });

  const routeB = await Route.create({
    name: 'Route 7 - Karol Bagh to Saket',
    startLocation: 'Karol Bagh',
    endLocation: 'Saket',
    distance: roadB.distanceKm,
    color: Route.ROUTE_COLORS[1],
    stops: buildStops(roadB.points, 'Karol Bagh', 'Saket'),
  });

  const busA = await Vehicle.create({
    vehicleNumber: 'bus_101',
    type: 'bus',
    capacity: 45,
    driverName: 'Rakesh Kumar',
    routeId: routeA._id,
    status: 'idle',
    currentLocation: { type: 'Point', coordinates: [routeAStart.lng, routeAStart.lat] },
  });

  const busB = await Vehicle.create({
    vehicleNumber: 'bus_202',
    type: 'bus',
    capacity: 40,
    driverName: 'Suresh Yadav',
    routeId: routeB._id,
    status: 'idle',
    currentLocation: { type: 'Point', coordinates: [routeBStart.lng, routeBStart.lat] },
  });

  await Schedule.create({
    vehicleId: busA._id,
    routeId: routeA._id,
    departureTime: '08:00',
    arrivalTime: '09:15',
    date: new Date().toISOString().slice(0, 10),
  });

  await Schedule.create({
    vehicleId: busB._id,
    routeId: routeB._id,
    departureTime: '09:00',
    arrivalTime: '09:50',
    date: new Date().toISOString().slice(0, 10),
  });

  console.log('Seed complete.');
  console.log('Admin login: admin@wheresmybus.test / Admin123!');
  console.log('Passenger login: riya@wheresmybus.test / Passenger123!');
  console.log('Try searching: "Connaught Place" to "Dwarka" (or "Karol Bagh" to "Saket")');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
