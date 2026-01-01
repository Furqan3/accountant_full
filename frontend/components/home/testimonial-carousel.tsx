"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    quote: "Filing our confirmation statement used to be a chore. Now it takes 5 minutes. Brilliant service!",
    author: "Mark Thompson",
    role: "Managing Director",
    company: "Thompson Consulting Ltd",
    image: "/professional-man-portrait.png",
  },
  {
    quote:
      "As a first-time director, I was lost with Companies House requirements. This platform made everything clear and simple.",
    author: "Sarah Chen",
    role: "Founder",
    company: "Chen Creative Studios",
    image: "/professional-woman-portrait.png",
  },
  {
    quote: "We manage filings for 50+ clients. This service has cut our admin time in half. Highly recommend!",
    author: "James Morrison",
    role: "Senior Partner",
    company: "Morrison & Associates",
    image: "/confident-businessman.png",
  },
]

const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">What Our Clients Say</h2>

        <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <img
              src={testimonials[current].image || "/placeholder.svg"}
              alt={testimonials[current].author}
              className="w-20 h-20 rounded-full object-cover mb-6"
            />
            <blockquote className="text-xl md:text-2xl text-gray-700 italic mb-6">
              "{testimonials[current].quote}"
            </blockquote>
            <div>
              <p className="font-semibold text-gray-900">{testimonials[current].author}</p>
              <p className="text-gray-600">
                {testimonials[current].role}, {testimonials[current].company}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition ${i === current ? "bg-teal-600" : "bg-gray-300"}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialCarousel
