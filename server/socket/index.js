// Basic connection lifecycle logging. The actual vehicle-movement events
// ('broadcastLocation') are emitted by socket/simulator.js, driven by
// admin status changes rather than raw client-emitted GPS - see
// controllers/vehicleController.js#updateStatus.
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerSocketHandlers;
