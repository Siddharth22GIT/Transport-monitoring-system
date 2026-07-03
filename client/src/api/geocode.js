// Resolves a place name typed by the admin (e.g. "Connaught Place, Delhi")
// into lat/lng using OpenStreetMap's free Nominatim geocoder. No API key
// needed, but please don't hammer it - it's a shared public service.
export async function geocodePlace(query) {
  if (!query || !query.trim()) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Geocoding request failed');

  const data = await res.json();
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
