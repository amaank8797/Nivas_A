export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-10">
      <div className="container mx-auto text-center">
        <h3 className="text-xl font-bold">Atithi_Nivas</h3>
        <p className="text-gray-400">Find your perfect stay with exclusive deals</p>
        <p className="mt-2 text-gray-500">© {new Date().getFullYear()} Atithi_Nivas. All rights reserved.</p>
      </div>
    </footer>
  );
}
