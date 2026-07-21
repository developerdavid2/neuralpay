import HeroBackground from "../components/hero-background";
import HeroGridMatrix from "../components/hero-grid-matrix";

export default function HeroSectionView() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050508] pt-28">
      <HeroBackground />
      <HeroGridMatrix />

      <div className="relative z-10 mx-auto flex max-w-[2000px] flex-col items-center px-4 text-center">
        <div className="relative w-full">
          <h1 className="select-none font-display text-[clamp(4.5rem,15vw,18rem)] font-extrabold leading-none tracking-tighter text-white/90">
            NEURAL
            <br />
            PAY
          </h1>
        </div>

        {/* Dashboard Mockup Device Frame */}
        {/* <div className="absolute translate-y-1/2 -mt-10 md:-mt-20 z-20 w-full max-w-4xl px-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-2 shadow-[0_0_50px_rgba(196,181,253,0.15)] backdrop-blur-xl">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-white/5 bg-[#0A0A0F] p-6 text-center">
              <span className="mb-2 text-2xl">⚡</span>
              <h3 className="font-display text-xl font-bold text-white">
                Interactive Dashboard Frame
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/50">
                Plaid/Mono open banking feed & CoinGecko portfolio visualizer
                preview.
              </p>
            </div>
          </div>
        </div> */}

        <p className="mt-10 max-w-md self-end text-end font-body text-base md:text-lg leading-relaxed text-white/60">
          NeuralPay connects to your bank accounts, explains your spending in
          plain English, and automates peer bill splits.
        </p>
      </div>
    </section>
  );
}
