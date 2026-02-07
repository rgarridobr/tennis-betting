import { ReactNode } from 'react'

interface PageHeroProps {
  title: string
  subtitle: string
  children?: ReactNode
}

export function PageHero({ title, subtitle, children }: PageHeroProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80')`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80" />
        
        {/* Content */}
        <div className="relative px-8 py-10 sm:px-10 sm:py-12 md:px-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white text-balance tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl text-balance font-medium">
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
