import { ReactNode, useMemo } from "react";

interface PageHeroProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
  bgImage?: string;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1541744686607-75102f024505?q=80&w=1419&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601646761285-65bfa67cd7a3?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555160679-b1b58488f476?q=80&w=1632&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1572452734990-62a82b486fcf?q=80&w=1471&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1641543678408-f0479974f438?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545151414-8a948e1ea54f?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620742820748-87c09249a72a?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545809074-59472b3f5ecc?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499510318569-1a3d67dc3976?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530915365347-e35b749a0381?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541744573515-478c959628a0?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?q=80&w=1470&auto=format&fit=crop",
];

export function PageHero({
  title,
  subtitle,
  children,
  bgImage,
}: PageHeroProps) {
  const backgroundImage =
    bgImage ||
    useMemo(() => {
      const index = Math.floor(Math.random() * HERO_IMAGES.length);
      return HERO_IMAGES[index];
    }, []);

  return (
    <div className="container mx-auto px-4 md:px-32 py-8">
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-75 scale-105"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />

        {/* Overlay forte + blur */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Glow sutil (efeito premium) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative px-8 py-12 sm:px-12 sm:py-16 md:px-16 md:py-33">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Text block */}
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                {title}
              </h1>

              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                <span className="block text-white font-semibold">
                  {subtitle.split("\n")[0]}
                </span>
                {subtitle.split("\n")[1] && (
                  <span className="block text-white/80 mt-1">
                    {subtitle.split("\n")[1]}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
