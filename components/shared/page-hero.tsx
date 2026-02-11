import { ReactNode, useMemo } from 'react'

interface PageHeroProps {
  title: string
  subtitle: string
  children?: ReactNode
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1646343253545-9171464ce425?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1465125672495-63cdc2fa22ed?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1646343249983-34dc5dd86b66?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530915534664-4ac6423816b7?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1470&auto=format&fit=crop',
]

export function PageHero({ title, subtitle, children }: PageHeroProps) {
  const backgroundImage = useMemo(() => {
    const index = Math.floor(Math.random() * HERO_IMAGES.length)
    return HERO_IMAGES[index]
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
        
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />

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
                {subtitle}
              </p>
            </div>
            <div className="flex shrink-0">
              {children}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
