import { ArrowRight, Sparkles } from 'lucide-react';
import type { Offer } from '@/lib/types';

interface HeroProps {
  offer: Offer | null;
  onShopNow: () => void;
}

export function Hero({ offer, onShopNow }: HeroProps) {
  const title = offer?.hero_title ?? 'End of Season Sale';
  const subtitle = offer?.hero_subtitle ?? 'Up to 60% off the latest arrivals';
  const tag = offer?.banner_tag ?? 'New Collection';

  return (
    <section className="relative overflow-hidden bg-ink-900">
      {/* Background gradient + texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200,132,58,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(53,140,115,0.2) 0%, transparent 50%)',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1.5 mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            <span className="text-xs font-medium tracking-wider uppercase text-brand-200">{tag}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] text-white animate-fade-in">
            {title}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-ink-300 max-w-xl animate-fade-in">
            {subtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in">
            <button
              onClick={onShopNow}
              className="btn-primary group"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onShopNow}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-medium text-white transition-all hover:border-white hover:bg-white/10"
            >
              View Offers
            </button>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { value: '60%', label: 'Up to Off' },
              { value: '500+', label: 'Styles' },
              { value: 'COD', label: 'Available' },
            ].map((stat) => (
              <div key={stat.label} className="border-l border-ink-700 pl-4">
                <div className="font-display text-3xl font-semibold text-white">{stat.value}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-ink-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full h-8 sm:h-12" preserveAspectRatio="none">
          <path d="M0,30 Q360,60 720,30 T1440,30 L1440,60 L0,60 Z" fill="#f6f7f8" />
        </svg>
      </div>
    </section>
  );
}
