const Schedule = require('../models/Schedule');

const listSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find()
      .populate('vehicleId', 'vehicleNumber type')
      .populate('routeId', 'name');
    res.json(schedules);
  } catch (err) {
    next(err);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const { vehicleId, routeId, departureTime, arrivalTime, date, daysOfWeek } = req.body;
    if (!vehicleId || !routeId || !departureTime || !arrivalTime) {
      return res.status(400).json({ message: 'vehicleId, routeId, departureTime, arrivalTime are required' });
    }
    const schedule = await Schedule.create({ vehicleId, routeId, departureTime, arrivalTime, date, daysOfWeek });
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
};

const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listSchedules, createSchedule, updateSchedule, deleteSchedule };