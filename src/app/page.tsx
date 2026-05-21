import "./page.module.css";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Features from "@/components/Features";
import NewCollections from "@/components/NewCollections";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

export const metadata = {
  title: "Moorafrika | Premium Fashion Design",
  description: "Discover Moorafrika's latest collections blending contemporary design with timeless aesthetics.",
};

export default function Home() {
  return (
    <main className="main-container">
      <Hero />
      <Gallery />
      <Features />
      <NewCollections />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
