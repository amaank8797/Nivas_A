import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageHotel.css";

const ManageHotel = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetchHotels();
  }, []);

const fetchHotels = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/v1/hotels");
    setHotels(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error("Error fetching hotels:", error);
  }
};
  const handleRemoveHotel = async (hotelId) => {
    try {
      await axios.delete(`http://localhost:3000/hotel/${hotelId}`);
      fetchHotels();
    } catch (error) {
      console.error("Error removing hotel:", error);
    }
  };

  return (
    <div className="manage-hotels-container">
      <h2 className="manage-hotels-title">Manage Hotels</h2>
      <ul className="hotel-list">
        {Array.isArray(hotels) && hotels.length > 0 ? (
          hotels.map((hotel) => (
            <li key={hotel.hotel_id || hotel.name} className="hotel-item">
              <span className="hotel-name">{hotel.name}</span>
              <button
                className="remove-button"
                onClick={() => handleRemoveHotel(hotel.hotel_id)}
              >
                Remove Hotel
              </button>
            </li>
          ))
        ) : (
          <p>No hotels available.</p>
        )}
      </ul>
    </div>
  );
};

export default ManageHotel;