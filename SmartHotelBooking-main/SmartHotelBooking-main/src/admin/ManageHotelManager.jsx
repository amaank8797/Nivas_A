import React, { useEffect, useState } from "react";
import axios from "axios";

const API_PREFIX = "http://localhost:3000/api/v1";

const ManageHotelManager = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_PREFIX}/users`);
      // Filter users with role 'hotelmanager'
      setManagers(res.data.filter((u) => u.role === "hotelmanager"));
    } catch (err) {
      setError("Failed to fetch hotel managers");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (user_id, status) => {
    try {
      await axios.patch(`${API_PREFIX}/users/${user_id}/status`, { status });
      setManagers(
        managers.map((m) => (m.user_id === user_id ? { ...m, status } : m))
      );
    } catch (err) {
      setError("Failed to update manager status");
    }
  };

  const fetchManagerDetails = async (user_id) => {
    try {
      const res = await axios.get(`${API_PREFIX}/users/${user_id}`);
      alert(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError("Failed to fetch manager details");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-gray-600">
        Loading hotel managers...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">🏨 Manage Hotel Managers</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Manager ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager, idx) => (
                <tr
                  key={manager.user_id}
                  className={`transition hover:bg-gray-50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 font-medium">{manager.user_id}</td>
                  <td className="px-6 py-4">{manager.name}</td>
                  <td className="px-6 py-4">{manager.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        manager.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {manager.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    {manager.status === "inactive" ? (
                      <button
                        onClick={() => updateStatus(manager.user_id, "active")}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition shadow-md bg-green-500 hover:bg-green-600 text-white"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(manager.user_id, "inactive")}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition shadow-md bg-red-500 hover:bg-red-600 text-white"
                      >
                        Inactivate
                      </button>
                    )}
                    <button
                      onClick={() => fetchManagerDetails(manager.user_id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition shadow-md bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No hotel managers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageHotelManager;
