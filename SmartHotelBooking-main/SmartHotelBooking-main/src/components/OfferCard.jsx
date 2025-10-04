import offers from "../assets/offer.jpg";
export default function OfferCard({ offer }) {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg hover:scale-105 transition">
      <img src={offers} alt={offer.title} className="w-full h-40 object-cover" />
      <div className="p-4 bg-white">
        <h3 className="font-bold text-lg">{offer.title}</h3>
        <p className="text-gray-600">{offer.description}</p>
      </div>
    </div>
  );
}
