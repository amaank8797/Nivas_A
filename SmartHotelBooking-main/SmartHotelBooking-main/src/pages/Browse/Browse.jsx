import React, { useEffect, useState } from "react";
import HotelCard from "../../components/HotelCard";
import "./Browse.css";

export default function Browse() {
  const [hotels, setHotels] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended"); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch hotels from API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/api/v1/hotels/");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setHotels(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load hotels");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e) => setQuery(e.target.value);

  // filter + sort
  const filtered = hotels
    .filter((h) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (h.amenities || []).some((a) => a.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      return 0; 
    });

  return (
    <div className="browse-page container-narrow">
      <div className="browse-header">
        <h2>Browse Hotels in Coimbatore</h2>
        <div className="browse-controls">
          <input
            type="search"
            placeholder="Search hotels, amenities or location..."
            value={query}
            onChange={handleSearch}
            className="search-input"
            aria-label="Search hotels"
          />
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort hotels"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {loading && <div className="status">Loading hotels…</div>}
      {error && <div className="status error">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="hotel-grid">
            <HotelCard />
          </div>

          {filtered.length === 0 && (
            <div className="no-results">No hotels match your search.</div>
          )}
        </>
      )}
    </div>
  );
}
