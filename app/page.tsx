import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ChessboardsDonatedSection } from "@/components/chessboards-donated-section";
import { AboutSection } from "@/components/about-section";
import { ProgramsSection } from "@/components/programs-section";
import { GallerySection } from "@/components/gallery-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      {/* Sections */}
      <ChessboardsDonatedSection />
      <AboutSection />
      <ProgramsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </main>
  );
}
