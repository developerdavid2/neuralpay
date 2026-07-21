import ViewportBlurProvider from "@/modules/landing/components/view-port-blur-provider";
import HeroSectionView from "@/modules/landing/pages/home/hero-section/ui/views/hero-section-view";

export default function Home() {
  return (
    <div className="relative w-full bg-[#050508]">
      {/* Client wrapper ONLY manages the fixed viewport blur event */}
      <ViewportBlurProvider>
        <section data-blur-section id="hero">
          <HeroSectionView />
        </section>

        {/* Static HTML Content — Zero JS shipped for this section container */}
        <section className="relative z-10 min-h-screen w-full border-t border-white/5 bg-[#050508] p-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-extrabold uppercase tracking-tight text-white md:text-6xl">
              Social Settlements
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/60">
              Split bills instantly with peer balance resolution—powered by open
              banking data.
            </p>
          </div>
        </section>
      </ViewportBlurProvider>
    </div>
  );
}
