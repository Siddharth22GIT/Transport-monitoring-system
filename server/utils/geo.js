// Haversine distance in km between two lat/lng points
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Given an ordered array of {lat, lng} points and a fraction (0-1) of the
// total path length, returns the interpolated {lat, lng} at that point.
// This keeps movement at a roughly constant visual speed along the whole
// route regardless of how unevenly spaced the stops are.
const pointAtFraction = (points, fraction) => {
  if (!points || points.length === 0) return null;
  if (points.length === 1) return points[0];

  const clamped = Math.max(0, Math.min(1, fraction));

  const segmentLengths = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = haversineKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
    segmentLengths.push(d);
    total += d;
  }

  if (total === 0) return points[0];

  let targetDist = clamped * total;
  for (let i = 0; i < segmentLengths.length; i++) {
    if (targetDist <= segmentLengths[i] || i === segmentLengths.length - 1) {
      const segFrac = segmentLengths[i] === 0 ? 0 : targetDist / segmentLengths[i];
      const a = points[i];
      const b = points[i + 1];
      return {
        lat: a.lat + (b.lat - a.lat) * Math.min(1, segFrac),
        lng: a.lng + (b.lng - a.lng) * Math.min(1, segFrac),
      };
    }
    targetDist -= segmentLengths[i];
  }
  return points[points.length - 1];
};

const totalPathLengthKm = (points) => {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
  }
  return total;
};

module.exports = { haversineKm, pointAtFraction, totalPathLengthKm };
