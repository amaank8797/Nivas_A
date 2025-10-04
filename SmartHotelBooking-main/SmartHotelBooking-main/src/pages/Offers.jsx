import OfferCard from "../components/OfferCard";
import { offers } from "../data/dummyData";

export default function Offers() {
  return (
    <div className="container mx-auto my-20">
      <h2 className="text-3xl font-bold mb-8">Exclusive Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map(o => <OfferCard key={o.id} offer={o} />)}
      </div>
    </div>
  );
}
