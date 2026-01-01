import type React from "react"
import Header from "../layout/header"
import {StarsBackground} from "../ui/stars"

interface PageHeroProps {
  title: string
}

const PageHero: React.FC<PageHeroProps> = ({ title }) => {
  return (
    <>
      {/* Header - Outside to prevent dropdown clipping */}
      <div className="relative z-50 bg-header-gradient px-6 pt-6">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="relative bg-custom-gradient pb-20 px-6 overflow-hidden">
        <StarsBackground />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-5xl pt-22 font-bold text-white">{title}</h1>
        </div>
      </section>
    </>
  )
}

export default PageHero
