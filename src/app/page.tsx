import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Origin from "@/components/landing/Origin";
import Supervisor from "@/components/landing/Supervisor";
import Booking from "@/components/landing/Booking";
import ContactForm from "@/components/landing/ContactForm";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "CloverFit",
  alternateName: "クローバーフィット",
  description: "起業家・経営者のための60分フィジカル×メンタルトレーニングプログラム",
  url: "https://clover-fit.com",
  logo: "https://clover-fit.com/images/cloverfit-logo.png",
  image: "https://clover-fit.com/images/training-bg.jpg",
  sameAs: ["https://www.instagram.com/cloverfit2026/"],
  address: { "@type": "PostalAddress", addressCountry: "JP" },
  offers: {
    "@type": "Offer",
    name: "体験予約",
    url: "https://clover-fit.com/#booking",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Origin />
        <Supervisor />
        <Booking />
        <ContactForm />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
