import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ChessboardsDonatedSection } from "@/components/chessboards-donated-section";
import { AboutSection } from "@/components/about-section";
import { ProgramsSection } from "@/components/programs-section";
import { ProgramsDetailSection } from "@/components/programs-detail-section";
import { ImpactReportSection } from "@/components/impact-report-section";
import { GallerySection } from "@/components/gallery-section";
import { PlayLearnSection } from "@/components/play-learn-section";
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
      <ProgramsDetailSection />
      <ImpactReportSection />
      <GallerySection />
      <PlayLearnSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
