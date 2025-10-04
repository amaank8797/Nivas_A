import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contextApi/AuthContext";

const API_BASE = "http://localhost:3000"; 

export default function Reviews() {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;

  const [reviews, setReviews] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotelMap, setHotelMap] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [formState, setFormState] = useState({});
  const [newReview, setNewReview] = useState({ hotel_id: "", rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch user's reviews + hotels
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [resReviews, resHotels] = await Promise.all([
          fetch(`${API_BASE}/api/v1/reviews/user/${userId}`),
          fetch(`${API_BASE}/api/v1/hotels`),
        ]);

        if (!resReviews.ok) throw new Error(`Failed to fetch reviews: ${resReviews.status}`);
        const reviewsData = await resReviews.json();

        let hotelsData = [];
        if (resHotels.ok) hotelsData = await resHotels.json();

        const map = {};
        (hotelsData || []).forEach((h) => {
          if (h && h.hotel_id) map[String(h.hotel_id)] = h.name;
        });

        if (!cancelled) {
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          setHotels(Array.isArray(hotelsData) ? hotelsData : []);
          setHotelMap(map);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Edit Review
  const handleEdit = (review) => {
    setEditing(review.review_id);
    setFormState((s) => ({
      ...s,
      [review.review_id]: { rating: review.rating, comment: review.comment || "" },
    }));
  };
  const handleCancel = () => setEditing(null);

  const handleSave = async (review_id) => {
    const update = formState[review_id];
    if (!update?.comment || !update?.rating) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/reviews/${review_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error(`Failed to update review: ${res.status}`);

      const updatedReview = await res.json();
      setReviews((prev) => prev.map((r) => (r.review_id === review_id ? updatedReview : r)));
      setEditing(null);
    } catch (err) {
      alert("Error updating review: " + err.message);
    }
  };

  // Delete Review
  const handleDelete = async (review_id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/reviews/${review_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete review: ${res.status}`);

      setReviews((prev) => prev.filter((r) => r.review_id !== review_id));
    } catch (err) {
      alert("Error deleting review: " + err.message);
    }
  };

  // Add New Review
  const handleAdd = async () => {
    if (!newReview.hotel_id || !newReview.comment) {
      alert("Please select a hotel and write a comment.");
      return;
    }

    const payload = {
      ...newReview,
      user_id: userId,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to add review: ${res.status}`);
      const created = await res.json();

      setReviews((prev) => [created, ...prev]);
      setNewReview({ hotel_id: "", rating: 5, comment: "" });
      setAdding(false);
    } catch (err) {
      alert("Error adding review: " + err.message);
    }
  };

  // UI
  if (loading) return <div className="p-6 text-center text-gray-600">Loading your reviews…</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="w-full pb-6">
      <div className="bg-white shadow rounded-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Reviews</h2>

        {/* Add New Review */}
        <div className="mb-6">
          {adding ? (
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="flex gap-3 mb-3">
                <select
                  value={newReview.hotel_id}
                  onChange={(e) => setNewReview({ ...newReview, hotel_id: e.target.value })}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select hotel</option>
                  {hotels.map((h) => (
                    <option key={h.hotel_id} value={h.hotel_id}>
                      {h.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="border rounded-md px-2 py-2 text-sm"
                >
                  <option value={5}>5 ★</option>
                  <option value={4}>4 ★</option>
                  <option value={3}>3 ★</option>
                  <option value={2}>2 ★</option>
                  <option value={1}>1 ★</option>
                </select>
              </div>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm mb-3"
                placeholder="Write your review..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
            >
              + Add Review
            </button>
          )}
        </div>

        {/* Reviews Table */}
        {reviews.length === 0 ? (
          <div className="text-center text-gray-500">You haven’t written any reviews yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Hotel</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Rating</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Comment</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Timestamp</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => {
                  const isEditing = editing === r.review_id;
                  const fs = formState[r.review_id] || { rating: r.rating, comment: r.comment || "" };

                  return (
                    <tr key={r.review_id} className="border-t last:border-b">
                      <td className="py-3 px-4">{hotelMap[r.hotel_id] || r.hotel_id}</td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={fs.rating}
                            onChange={(e) =>
                              setFormState((s) => ({
                                ...s,
                                [r.review_id]: { ...(s[r.review_id] || {}), rating: Number(e.target.value) },
                              }))
                            }
                            className="border rounded-md px-2 py-1 text-sm"
                          >
                            {[5, 4, 3, 2, 1].map((val) => (
                              <option key={val} value={val}>
                                {val} ★
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-yellow-500 font-semibold">⭐ {r.rating}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <textarea
                            value={fs.comment}
                            onChange={(e) =>
                              setFormState((s) => ({
                                ...s,
                                [r.review_id]: { ...(s[r.review_id] || {}), comment: e.target.value },
                              }))
                            }
                            className="w-full min-h-[80px] border rounded-md px-3 py-2 text-sm resize-y"
                          />
                        ) : (
                          <div className="text-gray-700">{r.comment}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(r.review_id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1 rounded-md text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(r)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.review_id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
