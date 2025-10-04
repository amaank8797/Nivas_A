
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contextApi/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:3000/api/v1";

export default function Payment() {
    const { bookingId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [room, setRoom] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                if (!bookingId) {
                    throw new Error("Booking ID is missing.");
                }
                console.log(`Fetching data for bookingId: ${bookingId}`);
                
                const bookingRes = await fetch(`${API_BASE}/bookings/${bookingId}`);
                if (!bookingRes.ok) throw new Error("Could not find your booking details.");
                const bookingData = await bookingRes.json();
                setBooking(bookingData);

                const roomRes = await fetch(`${API_BASE}/rooms/${bookingData.room_id}`);
                if (!roomRes.ok) throw new Error("Could not find room details.");
                const roomData = await roomRes.json();
                setRoom(roomData);

            } catch (err) {
                console.error("Failed to load payment data:", err);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [bookingId]);

    const calculateTotalDays = () => {
        if (!booking || !booking.checkindate || !booking.checkoutdate) return 1;
        const checkIn = new Date(booking.checkindate);
        const checkOut = new Date(booking.checkoutdate);
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1; 
    };

    const handlePayment = async () => {
        if (!booking || !room || !user) {
            toast.error("Missing booking, room, or user data. Cannot proceed.");
            return;
        }
        setProcessing(true);

        const totalAmount = room.price * calculateTotalDays();

        const newPayment = {
            user_id: user.user_id,
            bookingid: bookingId, 
            amount: totalAmount,
            status: "completed",
            paymentmethod: "Credit Card",
        };
        
        console.log("Attempting to create payment:", newPayment);

        try {
            const paymentRes = await fetch(`${API_BASE}/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPayment),
            });
            
            if (!paymentRes.ok) throw new Error("Payment creation failed on the server.");
            
            const createdPayment = await paymentRes.json();
            console.log("Payment record created:", createdPayment);

            if (!createdPayment.payment_id) {
                throw new Error("Server did not return a payment_id.");
            }

            console.log(`Updating booking ${bookingId} with payment_id: ${createdPayment.payment_id}`);
            const updateRes = await fetch(`${API_BASE}/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'confirmed', 
                    payment_id: createdPayment.payment_id 
                }),
            });

            if (!updateRes.ok) throw new Error("Failed to update booking status.");

            toast.success("Payment Successful! Your booking is confirmed.");
            navigate("/guest/bookings");

        } catch (err) {
            console.error("Payment failed:", err);
            toast.error("Payment failed: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center p-20">Loading payment details...</div>;
    if (!booking || !room) return <div className="text-center p-20">Could not load booking information. Please go back.</div>;

    const totalDays = calculateTotalDays();
    const totalAmount = room.price * totalDays;

    return (
        <div className="container mx-auto my-10 p-4 max-w-lg">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-amber-700 mb-6">Finalize Payment</h2>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-2">
                    <h3 className="font-bold text-lg">Booking Summary</h3>
                    <div className="flex justify-between"><span>Booking ID:</span> <strong>{bookingId}</strong></div>
                    <div className="flex justify-between"><span>Room Rate:</span> <span>₹{room.price.toLocaleString()} / night</span></div>
                    <div className="flex justify-between"><span>Number of Nights:</span> <span>{totalDays}</span></div>
                    <hr className="my-2"/>
                    <div className="flex justify-between text-xl font-bold"><span>Total Amount:</span> <span>₹{totalAmount.toLocaleString()}</span></div>
                </div>

                <div className="space-y-4">
                    <input placeholder="Card Number (e.g., 1234 5678 9101 1121)" className="w-full p-3 border rounded-lg" />
                    <div className="flex gap-4">
                        <input placeholder="MM/YY" className="w-1/2 p-3 border rounded-lg" />
                        <input placeholder="CVC" className="w-1/2 p-3 border rounded-lg" />
                    </div>
                </div>

                <button onClick={handlePayment} disabled={processing} className="w-full mt-6 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:bg-gray-400">
                    {processing ? "Processing..." : `Pay ₹${totalAmount.toLocaleString()} Now`}
                </button>
            </div>
        </div>
    );
}










