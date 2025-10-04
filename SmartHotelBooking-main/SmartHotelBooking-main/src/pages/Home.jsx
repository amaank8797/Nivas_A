
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import HotelCard from "../components/HotelCard";
import OfferCard from "../components/OfferCard";
import TestimonialCard from "../components/TestimonialCard";
import { offers } from "../data/dummyData"; // Assuming you still want static offers for now

export default function Home() {
  // 1. Add state to store the hotels
  const [featuredHotels, setFeaturedHotels] = useState([]);

  // 2. Fetch hotels when the component mounts
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/hotels");
        // 3. Take only the first 3 hotels for the "Featured" section
        setFeaturedHotels(response.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch hotels for home page:", error);
      }
    };
    fetchHotels();
  }, []); // Empty array ensures this runs only once

  return (
    <div>
      <Hero />

      <section className="container mx-auto my-10 px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Featured Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* 4. Map over the fetched hotels and render a linked HotelCard for each */}
          {featuredHotels.map((hotel) => (
            <Link to={`/hotel/${hotel.hotel_id}`} key={hotel.hotel_id}>
              <HotelCard hotel={hotel} />
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto my-20 px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Exclusive Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map(o => <OfferCard key={o.id} offer={o} />)}
        </div>
      </section>

      <section className="container mx-auto my-20 px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">What Our Guests Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TestimonialCard />
        </div>
      </section>
    </div>
  );
}
