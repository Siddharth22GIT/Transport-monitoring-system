import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LiveMap from './pages/LiveMap';
import PassengerSearch from './pages/PassengerSearch';
import AdminDashboard from './pages/AdminDashboard';
import TravelGuidelines from './pages/TravelGuidelines';
import EmergencyContacts from './pages/EmergencyContacts';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/travel-guidelines" element={<TravelGuidelines />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <PassengerSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}