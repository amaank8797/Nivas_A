
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contextApi/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:3000/api/v1";

export default function HotelDetails() {
  const { id } = useParams();
  
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHotelAndRooms() {
      setLoading(true);
      setError(null);
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          fetch(`${API_BASE}/hotels/${id}`),
          fetch(`${API_BASE}/rooms`),
        ]);

        if (!hotelRes.ok) throw new Error("Hotel not found");
        if (!roomsRes.ok) throw new Error("Could not load rooms");

        const hotelData = await hotelRes.json();
        const allRoomsData = await roomsRes.json();
        
       
        if (hotelData.image && !hotelData.image.startsWith('http')) {
            hotelData.image = `http://localhost:3000/images/${hotelData.image}`;
        }

        const hotelRooms = allRoomsData.filter(room => room.hotel_id === id);

        setHotel(hotelData);
        setRooms(hotelRooms);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
        loadHotelAndRooms();
    }
  }, [id]);

  const handleBookNowClick = (roomId) => {
    if (isLoggedIn) {
      navigate(`/booking/${id}/${roomId}`);
    } else {
      toast.error("Please login to book a room.");
      navigate("/auth");
    }
  };

  if (loading) return <div className="text-center p-20">Loading hotel details…</div>;
  if (error) return <div className="text-center p-20 text-red-500">Error: {error}</div>;
  if (!hotel) return <div className="text-center p-20">Hotel not found.</div>;

  return (
    <div className="container mx-auto my-10 p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img className="h-64 w-full object-cover md:h-full" src={hotel.image} alt={hotel.name} />
          </div>
          <div className="p-8 md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800">{hotel.name}</h2>
            <p className="text-gray-600 mt-2">{hotel.location}</p>
            <div className="flex items-center mt-4">
              <span className="text-yellow-500 font-bold text-xl">⭐ {hotel.rating}</span>
              <span className="text-gray-600 ml-4">({hotel.amenities.length} amenities)</span>
            </div>
            <p className="text-gray-700 mt-4">{hotel.amenities.join(", ")}</p>
            <p className="text-3xl text-amber-600 font-bold mt-6">₹{hotel.price}<span className="text-lg text-gray-600 font-normal">/night</span></p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-6">Available Rooms</h3>
        <div className="space-y-4">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.room_id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xl">{room.type} Room</h4>
                  <p className="text-gray-600">{room.features.join(" • ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-amber-700">₹{room.price}/night</p>
                  {room.availability ? (
                    <button onClick={() => handleBookNowClick(room.room_id)} className="mt-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                      Book Now
                    </button>
                  ) : (
                    <p className="mt-2 px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                      Unavailable
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No rooms available for this hotel.</p>
          )}
        </div>
      </div>
    </div>
  );
}

