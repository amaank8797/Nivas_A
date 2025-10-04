import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contextApi/AuthContext";

const API_BASE = "http://localhost:3000";

export default function Loyalty() {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;

  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [redeemAmt, setRedeemAmt] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch loyalty account + redemption history
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      try {
        setLoading(true);

        const [resLoyalty, resRedemptions] = await Promise.all([
          fetch(`${API_BASE}/api/v1/loyalty/${userId}`),
          fetch(`${API_BASE}/api/v1/redemptions/${userId}`),
        ]);

        if (resLoyalty.ok) {
          const data = await resLoyalty.json();
          setAccount(data[0]); 
        }

        if (resRedemptions.ok) {
          const data = await resRedemptions.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to load loyalty data", err);
        setMessage({ type: "error", text: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  // Handle Redeem points
  const handleRedeem = async () => {
    const points = parseInt(redeemAmt, 10);
    if (Number.isNaN(points) || points <= 0) {
      setMessage({ type: "error", text: "Enter a valid positive number of points." });
      return;
    }
    if (points > (account?.pointsbalance || 0)) {
      setMessage({ type: "error", text: "Not enough points to redeem that amount." });
      return;
    }

    try {
     
      const res = await fetch(`${API_BASE}/api/v1/redemptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          booking_id: "B001", 
          pointsused: points,
          discountamount: points, 
        }),
      });

      if (!res.ok) throw new Error("Failed to redeem");

      const newRedemption = await res.json();

      const updatedBalance = account.pointsbalance - points;
      await fetch(`${API_BASE}/api/v1/loyalty/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointsbalance: updatedBalance,
          lastupdated: new Date().toISOString().split("T")[0],
        }),
      });

      setAccount((a) => ({
        ...a,
        pointsbalance: updatedBalance,
        lastupdated: new Date().toISOString(),
      }));
      setHistory((h) => [newRedemption, ...h]);
      setRedeemAmt("");
      setMessage({ type: "success", text: `Redeemed ${points} points successfully.` });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Redemption failed. Try again." });
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-6">
        <div className="bg-white shadow rounded-md p-6 text-center text-gray-600">
          Loading loyalty details…
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="w-full pb-6">
        <div className="bg-white shadow rounded-md p-6 text-center text-gray-500">
          No loyalty account found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-6">
      <div className="bg-white shadow rounded-md p-4">
        <h2 className="text-xl font-semibold mb-4">Loyalty Points</h2>

        <div className="flex flex-wrap gap-4 items-start">
          {/* Points Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 w-80 shadow-sm">
            <div className="text-gray-500 font-bold mb-2">Total Points</div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              {account.pointsbalance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(account.lastupdated).toLocaleDateString()}
            </div>
          </div>

          {/* Redeem Card */}
          <div className="flex-1 min-w-[320px] bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="text-gray-700 mb-3">
              Use your loyalty points for discounts on future bookings. <br />
              Example rate: <strong>1 point = ₹1.00</strong>.
            </div>

            <div className="flex gap-3 items-center mb-3">
              <input
                type="number"
                min="1"
                placeholder="Points to redeem"
                value={redeemAmt}
                onChange={(e) => setRedeemAmt(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring focus:ring-amber-300"
              />
              <button
                onClick={handleRedeem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm"
              >
                Redeem
              </button>
            </div>

            {message && (
              <div
                className={`mt-2 px-3 py-2 rounded-md text-sm font-semibold ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>

        <hr className="my-6 border-t border-gray-200" />

        <h3 className="text-lg font-semibold mb-3">Redemption History</h3>
        <div className="flex flex-col gap-3">
          {history.length === 0 && (
            <div className="p-4 text-gray-500 font-medium text-center bg-gray-50 rounded-md">
              No redemptions yet.
            </div>
          )}

          {history.map((r) => (
            <div
              key={r.redemption_id}
              className="flex justify-between items-center bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3"
            >
              <div>
                <div className="text-gray-900 font-bold text-base">
                  -{r.pointsused} pts
                </div>
                <div className="text-gray-500 text-sm">
                  ₹{Number(r.discountamount).toFixed(2)} discount
                </div>
              </div>
              <div className="text-sm text-gray-500">Booking: {r.booking_id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
