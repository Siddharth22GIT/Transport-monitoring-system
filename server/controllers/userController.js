const User = require('../models/User');

// POST /api/users/pins/:vehicleId - toggles pin on/off
const togglePin = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPinned = user.pinnedVehicles.some((id) => String(id) === vehicleId);
    if (isPinned) {
      user.pinnedVehicles = user.pinnedVehicles.filter((id) => String(id) !== vehicleId);
    } else {
      user.pinnedVehicles.push(vehicleId);
    }
    await user.save();
    res.json({ pinnedVehicles: user.pinnedVehicles, pinned: !isPinned });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/pins
const getPins = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'pinnedVehicles',
      populate: { path: 'routeId' },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.pinnedVehicles);
  } catch (err) {
    next(err);
  }
};

module.exports = { togglePin, getPins };
