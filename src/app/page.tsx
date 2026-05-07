import "./page.module.css";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Features from "@/components/Features";
import NewCollections from "@/components/NewCollections";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Moorafrika | Premium Fashion Design",
  description: "Discover Moorafrika's latest collections blending contemporary design with timeless aesthetics.",
};

export default function Home() {
  return (
    <main className="main-container">
      <Navbar />
      <Hero />
      <Gallery />
      <Features />
      <NewCollections />
      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  );
}
