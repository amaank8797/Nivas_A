export default function Contact() {
  return (
    <div className="container mx-auto my-20">
      <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
      <form className="grid gap-4 max-w-lg">
        <input type="text" placeholder="Your Name" className="p-3 border rounded-lg" />
        <input type="email" placeholder="Your Email" className="p-3 border rounded-lg" />
        <textarea placeholder="Your Message" className="p-3 border rounded-lg"></textarea>
        <button className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700">
          Send Message
        </button>
      </form>
    </div>
  );
}
