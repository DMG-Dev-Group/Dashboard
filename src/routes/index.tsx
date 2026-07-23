import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/features/landing/Navbar";
import { Hero } from "@/features/landing/Hero";
import { Strip } from "@/features/landing/Strip";
import { BrandGrid } from "@/features/landing/BrandGrid";
import { MembersShowcase } from "@/features/landing/MembersShowcase";
import { Services } from "@/features/landing/Services";
import { CtaBanner } from "@/features/landing/CtaBanner";
import { Footer } from "@/features/landing/Footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-dmg-bg text-dmg-text">
      <Navbar />
      <Hero />
      <Strip />
      <BrandGrid />
      <MembersShowcase />
      <Services />
      <CtaBanner />
      <Footer />
    </div>
  );
}
