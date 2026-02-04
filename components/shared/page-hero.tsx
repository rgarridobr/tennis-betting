import { ReactNode } from 'react'

interface PageHeroProps {
  title: string
  subtitle: string
  children?: ReactNode
}

export function PageHero({ title, subtitle, children }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80')`,
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/90 to-teal-900/90" />
      
      {/* Content */}
      <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-balance">{title}</h1>
              <p className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base text-white/80 max-w-xl text-balance">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
