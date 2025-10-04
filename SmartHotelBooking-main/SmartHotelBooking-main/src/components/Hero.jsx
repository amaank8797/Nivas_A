
import { Link } from "react-router-dom";
import video1 from "../assets/video1.mp4"; 
import { useContext } from "react";
import { AuthContext } from "../contextApi/AuthContext";

export default function Hero() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={video1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Content */}
      <div className="relative text-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Discover Your Perfect Stay
        </h1>
        <p className="text-lg text-gray-200 mt-4">
          Book hotels and exclusive packages with Atithi_Nivas
        </p>
       
        <Link to={isLoggedIn ? "/hotels" : "/auth"}>
          <button className="mt-6 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            Book Now
          </button>
        </Link>
      </div>
    </section>
  );
}



  