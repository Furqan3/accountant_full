'use client';
import Header from "@/components/layout/header"
import { useAuth } from "@/context/auth-context"
import  {useRouter}  from "next/navigation"
import Footer from "@/components/layout/footer"
import TestimonialCarousel from "@/components/home/testimonial-carousel"
import { FaArrowRight } from "react-icons/fa"
import { SquareCheckBig } from 'lucide-react'
import { useState } from "react";

export default function Home() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
const handleRedirect = () => {
    if (!user) {
      router.push("/signup")
    }
    else {
      router.push("/company-search")
    }
  }
  const handleSearch = () => {
    localStorage.setItem("searchTerm", searchTerm);
    router.push("/company-search");
  }
    
    
  return (
    <>
      {/* HERO / COMPONENT */}
      <section className="relative overflow-hidden">
        {/* GRADIENT BACKGROUND */}
        <div className="absolute inset-0 bg-custom-gradient rounded-b-[3rem] h-[80%]" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-10xl mx-auto px-6">
          {/* HEADER */}
          <div className="pt-6">
            <Header />
          </div>

          {/* HERO CONTENT */}
          <div className="pb-68 flex flex-col lg:flex-row justify-between items-start relative">
            {/* TEXT - Now has more horizontal space */}
            <div className="space-y-6 text-white max-w-4xl lg:max-w-2xl pt-20 lg:pt-32 pl-6 lg:pl-12 xl:pl-20">
              <button
                onClick={() => router.push('/about')}
                className="bg-teal-800 hover:bg-teal-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
              >
                Explore who we are
                <FaArrowRight size={12} />
              </button>

              <h1 className="text-4xl lg:text-5xl xl:text-5xl font-bold leading-tight">
                Fast & Secure Companies House Filing Services
              </h1>

              <p className="text-base lg:text-lg opacity-90">
                File your confirmation statements, annual accounts, and company documents online in minutes.
                Professional, reliable service trusted by thousands of UK directors.
              </p>

              <div className="bg-white backdrop-blur rounded-lg p-1 flex gap-4 max-w-md">
                <input
                  type="text"
                  placeholder="Search Company..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow px-4 py-3 rounded-lg text-gray-800 focus:outline-none"
                />
                <button 
                onClick={handleSearch}
                className="bg-teal-700 hover:bg-teal-600 px-6 py-3 rounded-lg font-medium whitespace-nowrap">
                  Search
                </button>
              </div>
            </div>

            {/* IMAGE - Absolutely positioned to the far right */}
            <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-auto lg:pointer-events-none">
              <img src="hero.png" alt="Business" className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl h-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-30">
        <div className="max-w-7xl mx-auto lg:flex lg:items-center lg:gap-16">
          {/* LEFT IMAGE */}
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <img src="get_in_touch.png" alt="Team and Stats" className="rounded-xl  w-full" />
          </div>

          {/* RIGHT TEXT CONTENT */}
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our all-in-one solution for seamless company filings</h2>
            <p className="text-gray-600">
              We blend expert knowledge with powerful technology to help UK businesses stay compliant. File your company
              documents quickly and confidently — all in one place.
            </p>

            {/* Features */}
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600"><SquareCheckBig className="w-5 h-5" /></span> Expert Team of Professionals
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600"><SquareCheckBig className="w-5 h-5" /></span> Client-Centric Approach
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600"><SquareCheckBig className="w-5 h-5" /></span> Trusted by Industry Leaders
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600"><SquareCheckBig className="w-5 h-5" /></span> Tailored Financial Solutions
              </li>
            </ul>

            {/* Stats */}
            <div className="flex gap-10 text-gray-900 font-bold text-lg">
              <div>
                <span>20+</span>
                <p className="font-normal text-gray-500">Years of Experience</p>
              </div>
              <div>
                <span>8K</span>
                <p className="font-normal text-gray-500">Happy Clients</p>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={() => user ? router.push('/messages') : window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="bg-teal-800 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium mt-6"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative pb-64">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Main Heading */}
          <h2 className="text-gray-900 text-4xl md:text-5xl font-bold mb-6">
            Stay Compliant and File Confidently
            <br />
            with Our Trusted Filing Service
          </h2>

          {/* Subheading */}
          <p className="text-gray-700 text-lg md:text-xl mb-10 max-w-4xl mx-auto">
            We make company compliance simple. From confirmation statements to annual accounts, our platform ensures
            every filing is done accurately and on time — so you can focus on running your business.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={() => user ? router.push('/messages') : window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-8 rounded-md transition-colors duration-300"
            >
              Get in Touch
            </button>
          </div>
        </div>

        {/* Image - positioned to overlap 50% in this section and 50% in next section */}
        <div className="absolute left-0 right-0 bottom-0 translate-y-1/2 z-10">
          <div className="max-w-7xl mx-auto px-6 pt-30">
            <div className="overflow-hidden rounded-lg ">
              <img
                src="paper.png"
                alt="Financial documents with magnifying glass, ruler, and pencils"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#004250] py-20 pt-104">
        <div className="max-w-7xl mx-auto px-6">
          <div className="md:flex md:items-start md:gap-12">
            {/* Section Title on the Left */}
            <div className="md:w-1/3 mb-8 md:mb-0">
              <h2 className="text-white text-lg text-left md:text-left">How It Works</h2>
            </div>

            {/* Steps on the Right */}
            <div className="md:w-2/3 space-y-12 md:space-y-16">
              {/* Step 1 */}
              <div className="flex items-center gap-8 md:gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    01
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Find Your Company</h3>
                  <div className="w-full h-px bg-[#8F9AAE]" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-8 md:gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    02
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Select Services</h3>
                  <div className="w-full h-px bg-[#8F9AAE]" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-8 md:gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    03
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Secure Checkout</h3>
                  <div className="w-full h-px bg-[#8F9AAE]" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-8 md:gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    04
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">We File For You</h3>
                  <div className="w-full h-px bg-[#8F9AAE]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between relative z-10">
          {/* Left side: Faint overlay text */}
          <div className="lg:w-1/2">
            <p className="text-3xl md:text-4xl lg:text-4xl font-light text-black leading-tight">
              We are a strategic partner to our clients. We will help you to ideate your product from conception to
              iterative development support.
            </p>
          </div>

          {/* Right side: Stats and button */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-end text-center lg:text-right mt-16 lg:mt-0">
            {/* Number */}
            <h2 className="text-8xl md:text-9xl font-bold text-gray-300">20+</h2>

            {/* Centered line */}
            <div className="w-55 h-px bg-gray-800 my-4 mx-auto lg:mx-0" />

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-400 mb-8">Years of Experience</p>

            {/* Button */}
            <button
              onClick={() => router.push('/about')}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors"
            >
              More About Us
            </button>
          </div>
        </div>
      </section>

      <TestimonialCarousel />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Filing Services</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Professional Companies House filing services with guaranteed accuracy and fast turnaround
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Confirmation Statement */}
            <div className="bg-white rounded-2xl  overflow-hidden flex flex-col">
              {/* Icon */}
              <div className="p-8">
                <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>

              <div className="px-8 pb-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 text-center">Confirmation Statement</h3>
                <p className="text-gray-600 text-center mt-2 mb-8">Annual confirmation of company details</p>

                <p className="text-4xl font-bold text-gray-900 text-center mb-10">
                  $99 <span className="text-lg font-normal text-gray-600">USD/month</span>
                </p>
               
                  <button 
                  onClick={handleRedirect}
                   className="bg-teal-800 hover:bg-teal-900 text-white font-medium py-3 px-8 rounded-lg mb-10
             transition-all duration-300 ease-in-out
             hover:shadow-[0_8px_25px_rgba(13,148,136,0.5)]"
>
                    Get Started

                  </button>
               

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Services Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> Filed within 24 hours
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> Companies House receipt
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> Email confirmation
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> 100% accuracy guaranteed
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 2: Dormant Company Accounts (Featured) */}
            <div className="bg-teal-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform md:scale-105">
              {/* Icon */}
              <div className="p-8">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              <div className="px-8 pb-8 flex-grow flex flex-col text-white">
                <h3 className="text-2xl font-bold text-center">Dormant Company Accounts</h3>
                <p className="text-teal-100 text-center mt-2 mb-8">File accounts for non-trading (dormant) companies</p>

                <p className="text-4xl font-bold text-center mb-10">
                  $199 <span className="text-lg font-normal opacity-90">USD/month</span>
                </p>

                <button
                onClick={handleRedirect}
                className="bg-white hover:bg-gray-100 text-teal-700 font-medium py-3 px-8 rounded-lg mb-10
             transition-all duration-300 ease-in-out
             hover:shadow-[0_8px_25px_rgba(256,256,256,0.5)]"
>
                  Get Started
                </button>

                <div className="space-y-3">
                  <h4 className="font-semibold">Services Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3">
                      <span className="text-teal-300"><SquareCheckBig className="w-5 h-5" /></span> Suitable for dormant companies
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-teal-300"><SquareCheckBig className="w-5 h-5" /></span> Full compliance check
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-teal-300"><SquareCheckBig className="w-5 h-5" /></span> Filed within 48 hours
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-teal-300"><SquareCheckBig className="w-5 h-5" /></span> Professional preparation
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 3: Company Dissolution */}
            <div className="bg-white rounded-2xl  overflow-hidden flex flex-col">
              {/* Icon */}
              <div className="p-8">
                <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                    />
                  </svg>
                </div>
              </div>

              <div className="px-8 pb-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 text-center">Company Dissolution</h3>
                <p className="text-gray-600 text-center mt-2 mb-8">Voluntary strike-off and close your company</p>

                <p className="text-4xl font-bold text-gray-900 text-center mb-10">
                  $299 <span className="text-lg font-normal text-gray-600">USD/month</span>
                </p>

                <button 
                onClick={handleRedirect}
               className="bg-teal-800 hover:bg-teal-900 text-white font-medium py-3 px-8 rounded-lg mb-10
             transition-all duration-300 ease-in-out
             hover:shadow-[0_8px_25px_rgba(13,148,136,0.5)]"
>
                  Get Started
                </button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Services Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> Complete DS01 form
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> Director notification letters
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> Companies House filing
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-teal-600"><SquareCheckBig className="w-5 h-5" /></span> Gazette publication handling
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-10 py-20 overflow-hidden">
        {/* Content */}
        <section className="relative px-10 overflow-hidden">
          {/* Content */}
          <div className="bg-[#004250] z-10 max-w-8xl mx-auto flex flex-col lg:flex-row items-start justify-between px-6 lg:px-20 rounded-3xl">
            {/* Left: Text and Button */}
            <div className="text-center lg:text-left mb-12 lg:mb-0 py-20 lg:max-w-lg">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Get professional help with your company filings
              </h2>

             <button
  onClick={handleRedirect}
  className="mt-10 bg-white  hover:text-black text-teal-700 font-semibold py-4 px-10 
             rounded-full text-lg transition-all duration-300 ease-in-out
             hover: hover:scale-105"
>
  Get Started
</button>

            </div>

            {/* Right: Man with tablet */}
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <img
                src="profesional.png"
                alt="Businessman using tablet"
                className="w-full max-w-md lg:max-w-lg h-[400px] lg:h-[500px] object-contain rounded-lg"
              />
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </>
  )
}
