// Fetches a real road-following path between two points from OSRM's public
// demo routing server. This is what makes the route actually follow streets
// instead of drawing a straight line through rivers and buildings.
//
// Note: router.project-osrm.org is a free demo instance meant for light,
// non-commercial testing - it can be slow or rate-limited under heavy use.
// If it fails, callers should fall back to a straight line between points.
export async function getRoadRoute(start, end) {
  const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing service request failed');

  const data = await res.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No road route found between these points');
  }

  const route = data.routes[0];
  const points = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

  return {
    points, // ordered array of {lat,lng} following the actual road
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
    durationMin: Math.round(route.duration / 60),
  };
}
