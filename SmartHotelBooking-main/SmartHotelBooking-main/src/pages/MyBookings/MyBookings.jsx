import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contextApi/AuthContext";

const API_BASE = "http://localhost:3000"; 

export default function MyBookings() {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;

  const [bookings, setBookings] = useState([]);
  // const [roomsMap, setRoomsMap] = useState({});
  const [paymentsMap, setPaymentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState({});

  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      try {
        // fetch bookings, rooms and payments
        const [resBookings, resRooms, resPayments] = await Promise.all([
          fetch(`${API_BASE}/api/v1/bookings`),
          fetch(`${API_BASE}/api/v1/rooms`),
          fetch(`${API_BASE}/api/v1/payment`), 
        ]);

        if (!resBookings.ok) throw new Error(`Bookings error ${resBookings.status}`);
        if (!resRooms.ok) throw new Error(`Rooms error ${resRooms.status}`);
        if (!resPayments.ok) throw new Error(`Payments error ${resPayments.status}`);

        const dataBookings = await resBookings.json();
        // const dataRooms = await resRooms.json();
        const dataPayments = await resPayments.json();

        if (cancelled) return;

        // bookings array
        const arr = Array.isArray(dataBookings) ? dataBookings : [];

        // filter bookings for current user
        const userBookings = arr.filter((b) => String(b.user_id) === String(userId));

      
        // let roomsArr = [];
        // if (Array.isArray(dataRooms)) roomsArr = dataRooms;
        // else if (Array.isArray(dataRooms.rooms)) roomsArr = dataRooms.rooms;
        // else roomsArr = [];

        // const roomsLookup = {};
        // roomsArr.forEach((r) => {
        //   if (r && r.room_id) roomsLookup[r.room_id] = r.type || r.typeName || "—";
        // });

        
        let paymentsArr = [];
        if (Array.isArray(dataPayments)) paymentsArr = dataPayments;
        else if (Array.isArray(dataPayments.payment)) paymentsArr = dataPayments.payment;
        else paymentsArr = [];

        const paymentsLookup = {};
        paymentsArr.forEach((p) => {
          if (p && p.payment_id) paymentsLookup[p.payment_id] = p.amount;
        });

        // normalize bookings for UI
        const normalized = userBookings.map((b) => ({
          booking_id: b.booking_id || b.id || `${Math.random()}`,
          roomType: b.roomType || "—",
          checkindate: b.checkindate || b.checkIn || "",
          checkoutdate: b.checkoutdate || b.checkOut || "",
          status: b.status || "unknown",
          payment_id: b.payment_id || b.paymentId || "—",
        }));

        setBookings(normalized);
        // setRoomsMap(roomsLookup);
        setPaymentsMap(paymentsLookup);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load bookings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const fmt = (iso) => {
    try {
      if (!iso) return "—";
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling((s) => ({ ...s, [bookingId]: true }));

    try {
    
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      alert("Failed to cancel booking. Try again.");
      console.log(err)
    } finally {
      setCancelling((s) => ({ ...s, [bookingId]: false }));
    }
  };

  const statusClasses = {
    "checked-in": "bg-teal-600",
    pending: "bg-amber-500",
    confirmed: "bg-green-600",
    cancelled: "bg-red-500",
    completed: "bg-teal-600",
    unknown: "bg-gray-500",
  };

  if (loading) {
    return (
      <div className="w-full pb-6">
        <div className="bg-white shadow rounded-md p-6 text-center text-gray-600">
          Loading your bookings…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pb-6">
        <div className="bg-white shadow rounded-md p-6 text-center text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="w-full pb-6">
        <div className="bg-white shadow rounded-md p-6">
          <h2 className="text-xl font-semibold mb-2">My Bookings</h2>
          <div className="mt-4 text-center text-gray-500">
            You have no bookings yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-6">
      <div className="bg-white shadow rounded-md p-4">
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-700 border-b">Booking ID</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700 border-b">Room Type</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700 border-b">Check-in</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700 border-b">Check-out</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700 border-b">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700 border-b">Amount</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700 border-b">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => {
                const amount = paymentsMap[b.payment_id];
                return (
                  <tr key={b.booking_id} className="border-b">
                    <td className="py-3 px-4 font-medium">{b.booking_id}</td>
                    <td className="py-3 px-4">{b.roomType || "—"}</td>
                    <td className="py-3 px-4">{fmt(b.checkindate)}</td>
                    <td className="py-3 px-4">{fmt(b.checkoutdate)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${
                          statusClasses[b.status?.toLowerCase()] || statusClasses.unknown
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {typeof amount === "number" ? `₹${Number(amount).toLocaleString()}` : (amount ? `₹${amount}` : "—")}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700"
                        onClick={() => alert(`View booking ${b.booking_id} — placeholder`)}
                      >
                        View
                      </button>
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <button
                          className="border border-gray-300 bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-100"
                          onClick={() => handleCancel(b.booking_id)}
                          disabled={!!cancelling[b.booking_id]}
                        >
                          {cancelling[b.booking_id] ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
