import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { EventSection } from "@/components/sections/EventSection";
import { Footer } from "@/components/footer/Footer";

export default function Page() {
  return (
    <main className="overflow-hidden">
      <div
        className=""
        style={{
          backgroundImage: "radial-gradient(circle at top left, rgba(253,186,202,0.18), transparent 26%)",
        }}
      >
        <HeroSection />
      </div>
      <AboutSection />
      <EventSection />
      <Footer />
    </main>
  );
}
