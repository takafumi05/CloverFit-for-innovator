import Analytics from "@/components/Analytics";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Problem from "@/components/site/Problem";
import About from "@/components/site/About";
import Trust from "@/components/site/Trust";
import Features from "@/components/site/Features";
import Flow from "@/components/site/Flow";
import Score from "@/components/site/Score";
import Benefits from "@/components/site/Benefits";
import Conditions from "@/components/site/Conditions";
import Pricing from "@/components/site/Pricing";
import CTA from "@/components/site/CTA";
import FAQ from "@/components/site/FAQ";
import ContactForm from "@/components/site/ContactForm";
import Footer from "@/components/site/Footer";
import ScrollReveal from "@/components/site/ScrollReveal";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CloverFit",
  alternateName: "クローバーフィット",
  description:
    "社員の心身コンディションを可視化する法人向けウェルビーイングプログラム",
  url: "https://clover-fit.com",
  logo: "https://clover-fit.com/images/cloverfit-logo.png",
  areaServed: "東京都",
  makesOffer: {
    "@type": "Offer",
    name: "無料体験会",
    url: "https://clover-fit.com/#contact",
    price: "0",
    priceCurrency: "JPY",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Analytics />
      <Header />
      <main>
        <Hero />
        <Problem />
        <About />
        <Trust />
        <Features />
        <Flow />
        <Score />
        <Benefits />
        <Conditions />
        <Pricing />
        <CTA />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
