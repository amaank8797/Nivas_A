
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // --- IMPORT LINK ---
import HotelCard from "../components/HotelCard";

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    async function fetchHotels() {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/hotels");
        setHotels(response.data || []);
      } catch (err) {
        console.error("Failed to load hotels", err);
      }
    }
    fetchHotels();
  }, []);

  const filteredHotels = hotels
    .filter((h) => {
      const term = search.toLowerCase();
      return (
        h.name?.toLowerCase().includes(term) || h.location?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sort === "priceLow") return a.price - b.price;
      if (sort === "priceHigh") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="container mx-auto my-20 px-4">
      <h2 className="text-3xl font-bold mb-6">All Hotels</h2>

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-amber-300"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-amber-300"
        >
          <option value="">Sort By</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
          <option value="rating">Rating: High → Low</option>
        </select>
      </div>

      {/* --- WRAP HOTELCARD WITH LINK --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.length > 0 ? (
          filteredHotels.map((hotel) => (
            <Link to={`/hotel/${hotel.hotel_id}`} key={hotel.hotel_id}>
              <HotelCard hotel={hotel} />
            </Link>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No hotels match your search.
          </p>
        )}
      </div>
    </div>
  );
}
