import React, { useState, useEffect } from 'react';
import './ManageRoom.css';

const API_BASE = "http://localhost:3000/api/v1"; // Change if your mock server runs elsewhere

const ManageRooms = () => {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ type: '', price: '', total: '' });

  // Fetch hotels on mount
  const fetchHotels=async()=>{
    fetch(`${API_BASE}/hotels`)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(setHotels)
    .catch(err => {
      console.error("Failed to fetch hotels:", err);
      setHotels([]); // Clear hotels on error
      alert("Unable to load hotels. Please try again later.");
    });
  }
  useEffect(() => {
    fetchHotels();
  }, []);
  // Fetch rooms when hotel changes
  useEffect(() => {
    if (selectedHotelId) {
      fetch(`${API_BASE}/rooms?hotelId=${selectedHotelId}`)
        .then(res => res.json())
        .then(setRooms)
        .catch(err => console.error("Failed to fetch rooms:", err));
    } else {
      setRooms([]);
    }
  }, [selectedHotelId]);

  const handleHotelChange = (event) => {
    setSelectedHotelId(event.target.value);
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!selectedHotelId || !newRoomData.type || !newRoomData.price || !newRoomData.total) {
      alert('Please fill all fields and select a hotel.');
      return;
    }
    // POST to mock server
    fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRoomData,
        hotelId: selectedHotelId,
        price: parseFloat(newRoomData.price),
        total: parseInt(newRoomData.total),
      }),
    })
      .then(res => res.json())
      .then(room => {
        setRooms(prev => [...prev, room]);
        setNewRoomData({ type: '', price: '', total: '' });
        setIsModalOpen(false);
      })
      .catch(err => alert("Failed to add room: " + err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRoomData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditRoom = (roomId) => {
    alert(`Editing room: ${roomId}`);
    // Implement edit logic here (e.g., open a pre-filled modal)
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm(`Are you sure you want to delete room ${roomId}?`)) {
      fetch(`${API_BASE}/rooms/${roomId}`, { method: 'DELETE' })
        .then(() => setRooms(prev => prev.filter(room => room.room_id !== roomId)))
        .catch(err => alert("Failed to delete room: " + err));
    }
    fetchHotels();
  };

  return (
    <div className="manage-rooms-container">
      <div className="manage-rooms-header">
        <h1>Manage Rooms</h1>
        <button className="add-room-btn" onClick={() => setIsModalOpen(true)}>
          Add Rooms
        </button>
      </div>

      <div className="filter-section">
        <label htmlFor="hotel-select">Select hotel</label>
        <select id="hotel-select" value={selectedHotelId} onChange={handleHotelChange}>
          <option value="">-- Select a Hotel --</option>
          {hotels.map(hotel => (
            <option key={hotel.id} value={hotel.id}>
              {hotel.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rooms-table-container">
        {selectedHotelId ? (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Room Type</th>
                <th>Price / Night</th>
                <th>Total Rooms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length > 0 ? (
                rooms.map(room => (
                  <tr key={room.id}>
                    <td>{room.type}</td>
                    <td>₹ {room.price.toLocaleString()}</td>
                    <td>{room.total}</td>
                    <td>
                      <button className="action-btn edit-btn" onClick={() => handleEditRoom(room.room_id)}>Edit</button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteRoom(room.room_id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No rooms available for this hotel.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p className="select-hotel-prompt">Please select a hotel to view and manage its rooms.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Room</h2>
            <form onSubmit={handleAddRoom}>
              <div className="form-group">
                <label htmlFor="roomType">Room Type:</label>
                <input
                  id="roomType"
                  type="text"
                  name="type"
                  value={newRoomData.type}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price / Night (₹):</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={newRoomData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="totalRooms">Total Rooms:</label>
                <input
                  id="totalRooms"
                  type="number"
                  name="total"
                  value={newRoomData.total}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-add-btn">Add Room</button>
                <button type="button" className="modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
