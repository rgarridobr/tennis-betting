import { ReactNode, useMemo } from 'react';

interface PageHeroProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
  bgImage?: string;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1541744686607-75102f024505?q=80&w=1419&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1601646761285-65bfa67cd7a3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1555160679-b1b58488f476?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1572452734990-62a82b486fcf?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1641543678408-f0479974f438?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1530915365347-e35b749a0381?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1646343251574-a7b03ee3dbaf?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

export function PageHero({ title, subtitle, children, bgImage }: PageHeroProps) {
  const backgroundImage =
    bgImage ||
    useMemo(() => {
      const index = Math.floor(Math.random() * HERO_IMAGES.length);
      return HERO_IMAGES[index];
    }, []);

  return (
    <div className="container mx-auto px-4 md:px-32 py-8">
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundImage}')` }} />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80" />

        {/* Content */}
        <div className="relative px-8 py-12 sm:px-12 sm:py-16 md:px-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl font-medium">
                {subtitle.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>
            <div className="flex shrink-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
