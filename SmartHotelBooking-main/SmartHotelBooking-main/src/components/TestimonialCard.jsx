import axios from "axios";
import { useEffect, useState } from "react";

export default function TestimonialCard() {
  const [testimonials,setTestimonials]=useState([]);

  const fetchTestimonials=async()=>{
    const resp=await axios.get("http://localhost:3000/api/v1/reviews");
    setTestimonials(resp.data);

  }
  useEffect(()=>{
    fetchTestimonials();
  },[])
  return (
    <>
    {
      testimonials.map((testimonial)=>(

        <div key={testimonial.review_id} className="bg-white p-6 rounded-lg shadow-md">
      <p className="italic text-gray-600">“{testimonial.comment}”</p>
      <div className="mt-4">
      <h4 className="font-bold">{testimonial.name}</h4>
      <p className="text-yellow-500">{"⭐".repeat(testimonial.rating)}</p>
      </div>
      </div>
      ))}
    </>
  );
}
