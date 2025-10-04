export default function HotelCard({ hotel }) {
  if (!hotel) return null; 

  return (
    <div className="border rounded-lg shadow hover:shadow-lg transition w-full h-full bg-white">
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{hotel.name}</h3>
        <p className="text-gray-600">{hotel.location}</p>
        <p className="text-amber-600 font-bold mt-2">₹{hotel.price}/night</p>
        <p className="text-sm text-gray-500">⭐ {hotel.rating}</p>
      </div>
    </div>
  );
}
