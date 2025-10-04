import React, { useState } from "react";
import "./SavedAddress.css";

export default function SavedAddress() {
  const [addresses, setAddresses] = useState([]);

  const [form, setForm] = useState({
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    contact: ""
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      contact: ""
    });
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!form.line1 || !form.city || !form.state || !form.pincode || !form.contact) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingIndex !== null) {
      // update existing
      setAddresses((prev) =>
        prev.map((a, i) => (i === editingIndex ? { ...form } : a))
      );
    } else {
      // add new
      setAddresses((prev) => [{ ...form }, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setForm(addresses[idx]);
  };

  const handleDelete = (idx) => {
    if (!confirm("Delete this address?")) return;
    setAddresses((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="addresses-page">
      <div className="panel">
        <h2>Saved Addresses</h2>

        <div className="address-form">
          <div className="form-grid">
            <input
              name="line1"
              placeholder="Address Line 1 *"
              value={form.line1}
              onChange={handleChange}
              className="input"
            />
            <input
              name="line2"
              placeholder="Address Line 2"
              value={form.line2}
              onChange={handleChange}
              className="input"
            />
            <input
              name="landmark"
              placeholder="Landmark"
              value={form.landmark}
              onChange={handleChange}
              className="input"
            />
            <input
              name="city"
              placeholder="City *"
              value={form.city}
              onChange={handleChange}
              className="input"
            />
            <input
              name="state"
              placeholder="State *"
              value={form.state}
              onChange={handleChange}
              className="input"
            />
            <input
              name="pincode"
              placeholder="Pincode *"
              value={form.pincode}
              onChange={handleChange}
              className="input"
            />
            <input
              name="contact"
              placeholder="Contact Number *"
              value={form.contact}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={handleSave}>
              {editingIndex !== null ? "Update Address" : "Save Address"}
            </button>
            <button className="btn btn-outline" onClick={resetForm}>
              Reset
            </button>
          </div>
        </div>

        <div className="address-list">
          {addresses.length === 0 && (
            <div className="empty">No addresses saved yet.</div>
          )}

          {addresses.map((addr, idx) => (
            <div className="address-item" key={idx}>
              <div className="addr-text">
                <div><strong>{addr.line1}</strong></div>
                {addr.line2 && <div>{addr.line2}</div>}
                {addr.landmark && <div>Landmark: {addr.landmark}</div>}
                <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                <div>Contact: {addr.contact}</div>
              </div>
              <div className="actions">
                <button className="btn btn-outline" onClick={() => handleEdit(idx)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
