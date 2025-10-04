
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contextApi/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:3000/api/v1";

export default function Booking() {
  const { hotelId, roomId } = useParams();
  const { user } = useContext(AuthContext); // Get the logged-in user
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      try {
        const [hotelRes, roomRes] = await Promise.all([
          fetch(`${API_BASE}/hotels/${hotelId}`),
          fetch(`${API_BASE}/rooms/${roomId}`),
        ]);

        if (!hotelRes.ok || !roomRes.ok) {
            throw new Error("Could not load booking details");
        }

        const hotelData = await hotelRes.json();
        const roomData = await roomRes.json();

        if (hotelData.image && !hotelData.image.startsWith('http')) {
            hotelData.image = `http://localhost:3000/images/${hotelData.image}`;
        }

        setHotel(hotelData);
        setRoom(roomData);
      } catch (err) {
        console.error("Failed to load booking details:", err);
        toast.error("Could not load booking details.");
      }
    }
    loadDetails();
  }, [hotelId, roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dates.checkIn || !dates.checkOut) {
      return toast.error("Please select check-in and check-out dates.");
    }
    if (new Date(dates.checkOut) <= new Date(dates.checkIn)) {
      return toast.error("Check-out date must be after the check-in date.");
    }

    setSubmitting(true);
    const newBooking = {
      user_id: user.user_id,
      hotel_id:hotelId,
      room_id: roomId,
      checkindate: dates.checkIn,
      checkoutdate: dates.checkOut,
      status: "pending",
    };

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (!res.ok) throw new Error("Booking request failed");
      const bookingData = await res.json();
      
      toast.success("Booking initiated. Proceeding to payment.");
      navigate(`/payment/${bookingData.booking_id}`);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hotel || !room) return <div className="text-center p-20">Loading...</div>;

  return (
    <div className="container mx-auto my-10 p-4 max-w-4xl">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-amber-700 mb-8">Confirm Your Booking</h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img src={hotel.image} alt={hotel.name} className="rounded-lg shadow-md w-full h-64 object-cover" />
            <h3 className="text-2xl font-bold mt-4">{hotel.name}</h3>
            <p className="text-gray-600">{hotel.location}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-lg">Selected Room: {room.type}</h4>
              <p className="font-bold text-amber-600 text-xl">₹{room.price} / night</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Check-in Date</label>
              <input type="date" onChange={e => setDates({...dates, checkIn: e.target.value})} className="w-full p-3 border rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Check-out Date</label>
              <input type="date" onChange={e => setDates({...dates, checkOut: e.target.value})} className="w-full p-3 border rounded-lg" required />
            </div>
            <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition" disabled={submitting}>
              {submitting ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}



