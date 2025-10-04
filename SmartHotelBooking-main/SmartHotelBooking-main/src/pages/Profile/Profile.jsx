import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contextApi/AuthContext";

const API_BASE = "http://localhost:3000";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/users/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  loadProfile();
  }, [userId]);

  if (loading) return <div className="p-6">Loading profile…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="w-full pb-6">
      <div className="bg-white shadow rounded-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>

        {profile && (
          <div className="space-y-2 mb-6">
            <div><span className="font-semibold">Name:</span> {profile.name}</div>
            {/* <div><span className="font-semibold">Username:</span> {profile.username}</div> */}
            <div><span className="font-semibold">Email:</span> {profile.email}</div>
            <div><span className="font-semibold">Contact Number:</span> {profile.contactnumber}</div>
            <div><span className="font-semibold">Role:</span> {profile.role}</div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          
        </div>
      </div>
    </div>
  );
}
