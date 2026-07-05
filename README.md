# Where's My Bus

Real-time public transport tracking. MERN stack + Socket.IO + Leaflet.
Admin creates routes and starts buses running; passengers search a route,
see live status, and pin their regulars.

## Structure
```
transit-tracker/
├── server/   # Node + Express + MongoDB + Socket.IO API
└── client/   # React (Vite) + Tailwind v4 + Leaflet + lucide-react icons
```

## Prerequisites

- Node 18+
- A MongoDB Atlas connection string (free tier is fine)

## 1. Backend setup

```bash
cd server
cp .env.example .env
# edit .env: paste your MONGO_URI and a random JWT_SECRET
npm install
npm run seed      # demo admin + passenger + 2 routes + 2 buses (idle)
npm run dev        # starts server on http://localhost:5000
```

Demo logins from `npm run seed`:
- Admin: `admin@wheresmybus.test` / `Admin123!`
- Passenger: `riya@wheresmybus.test` / `Passenger123!`

## 2. Frontend setup

Second terminal:

```bash
cd client
cp .env.example .env   # defaults already point at localhost:5000
npm install
npm run dev             # http://localhost:5173
```

## 3. Try it end to end

1. Log in as **admin**. Go to `/admin`.
2. **Routes tab**: two demo routes already exist (color-coded). To add your
   own: type a route name, a start location and end location, click
   "Locate" next to each (this geocodes the text via OpenStreetMap - no API
   key needed), then "Add route".
3. **Vehicles tab**: buses are seeded idle. Click **Start** on a vehicle
   that has a route assigned - this is what makes it move. The backend
   drives the motion server-side in small smooth steps (no teleporting),
   emitted over Socket.IO to every connected client roughly twice a second.
4. Log in as **passenger** (or open a second browser/incognito window).
   Go to `/search`, enter e.g. "Connaught Place" → "Dwarka", hit
   **Search for a bus**. If a bus is assigned to a matching route you'll
   get a card with bus number, driver, schedule, and live status.
5. Click the card to jump to the live map, filtered to that route with its
   colored path highlighted. Click the star on a card to pin it - pinned
   buses show up at the bottom of `/search` on future visits.

## What's implemented

- JWT auth (register/login, role-based: passenger/admin)
- Route CRUD with real geocoding (OpenStreetMap Nominatim) — admin types
  place names, gets real lat/lng, no manual coordinate entry
- Each route gets an auto-assigned distinct color, drawn as a highlighted
  polyline on the map, distinguishable across multiple concurrent routes
- Vehicle CRUD + a dedicated `PUT /vehicles/:id/status` endpoint - the
  **only** way a bus starts moving is an admin explicitly starting it
  (must have a route assigned first)
- Server-driven smooth simulation (`server/socket/simulator.js`): moves a
  running vehicle in ~125 small increments over about 100 seconds per full
  route, broadcasting every 800ms - no more "100km in 2 seconds"
- Passenger search (`GET /routes/search?from=&to=&date=`): case-insensitive
  match on route start/end, returns one card per assigned vehicle with its
  schedule
- Pinning (`server/controllers/userController.js`): passengers can
  star/unstar buses, persisted per-user in MongoDB
- Light, bold, icon-driven UI (lucide-react) - "Where's My Bus" branding

## Not yet built

- Push notification / toast delay alerts
- PWA wrapper, offline caching, multilingual UI
- Automated tests (Jest)
- Turn-by-turn road-following paths (routes currently interpolate in a
  straight line between stops - fine for a demo, not GPS-accurate)

## Deploying

- Backend → Railway or Render (`MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`)
- Frontend → Vercel or Netlify (`VITE_API_URL`, `VITE_SOCKET_URL` pointed
  at your deployed backend)
- DB → MongoDB Atlas, whitelist your backend host's IP
