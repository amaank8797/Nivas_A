import React, { useState, useEffect } from 'react';
import './ViewBookings.css';

const API_BASE = "http://localhost:3000/api/v1"; // Change if your mock server runs elsewhere

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Fetch bookings from mock server
  useEffect(() => {
    fetch(`${API_BASE}/bookings`)
      .then(res =>{return res.json();})
      .then(setBookings)
      .catch(err => console.error("Failed to fetch bookings:", err));
  }, []);

  // Filter bookings based on search term
  useEffect(() => {
    const result = bookings.filter(booking =>
      booking?.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking?.hotel?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(result);
  }, [searchTerm, bookings]);

  const handleAction = (bookingId, actionType) => {
    alert(`Action "${actionType}" on Booking ID: ${bookingId}`);
    // In a real application, you'd send an API request here
    // e.g., fetch(`${API_BASE}/bookings/${bookingId}`, { method: 'PUT', body: JSON.stringify({ status: 'Confirmed' }) })
  };

  return (
    <div className="view-bookings-container">
      <div className="bookings-header">
        <h1>View Bookings</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Guest or Hotel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking Id</th>
              <th>Guest Name</th>
              <th>Hotel</th>
              <th>Room Type</th>
              <th>Check In</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.guestName}</td>
                  <td>{booking.hotel}</td>
                  <td>{booking.roomType}</td>
                  <td>{booking.checkIn}</td>
                  <td>
                    {booking.status === 'Pending' ? (
                      <button
                        className="action-btn confirm-btn"
                        onClick={() => handleAction(booking.id, 'Confirm')}
                      >
                        Confirm
                      </button>
                    ) : (
                      <span className="booking-status">{booking.status}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-bookings-message">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewBookings;
