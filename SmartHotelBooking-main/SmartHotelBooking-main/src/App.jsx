// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public pages
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import HotelDetails from "./pages/HotelDetails/HotelDetails";

// User pages
import Loyalty from "./pages/Loyalty/Loyalty";
import MyBookings from "./pages/MyBookings/MyBookings";
import Reviews from "./pages/Reviews/Reviews";
import Profile from "./pages/Profile/Profile";
import Booking from "./pages/Booking/Booking";
import Payment from "./pages/Payment/Payment";

// Layouts
import GuestLayout from "./layouts/GuestLayout";
import AdminLayout from "./admin/AdminLayout";
import HotelManagerLayout from "./components/hotelManager/HotelManagerLayout";

// Admin pages

// Hotel Manager pages
import ManageHotel from "./components/hotelManager/Manage_Hotel/ManageHotel";
import ManageRooms from "./components/hotelManager/Manage_Room/ManageRoom";
import ViewBookings from "./components/hotelManager/View_Bookings/ViewBookings";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoutes";
import ManageHotelManager from "./admin/manageHotelManager";
import ManageUser from "./admin/manageUser";
import AdminReviews from "./admin/adminReviews";

export default function App() {
  return (
    <Router>
      {/* Global Navbar */}
      <Navbar />

      <div className="pt-16">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />

          {/* Auth (public only) */}
          <Route element={<PublicRoute />}>
            <Route path="/auth" element={<Auth />} />
          </Route>

          {/* User dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/user" element={<GuestLayout />}>
              <Route index element={<Profile />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="loyalty" element={<Loyalty />} />
              <Route path="reviews" element={<Reviews />} />
              {/* default redirect */}
              <Route index element={<Navigate to="bookings" replace />} />
            </Route>
            {/* booking + payment */}
            <Route path="/booking/:hotelId/:roomId" element={<Booking />} />
            <Route path="/payment/:bookingId" element={<Payment />} />
          </Route>

          {/* Admin dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<ManageHotelManager />} />
              <Route path="manage-user" element={<ManageUser />} />
              <Route path="manage-reviews" element={<AdminReviews />} />
            </Route>
          </Route>

          {/* Hotel Manager dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["hotelmanager"]} />}>
            <Route path="/hotelmanager" element={<HotelManagerLayout />}>
              <Route index element={<ManageHotel />} />
              <Route path="manage-room" element={<ManageRooms />} />
              <Route path="view-bookings" element={<ViewBookings />} />
            </Route>
          </Route>
        </Routes>
      </div>

      {/* Global Footer */}
      <Footer />
    </Router>
  );
}
