"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function HeroCta() {
  const t = useTranslations("home");

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("como-funciona");
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset;
      
      // Custom fast smooth scroll
      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = 300; // Even faster (300ms)
      let start: number | null = null;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function (easeInOutCubic)
        const easing = percentage < 0.5 
          ? 4 * percentage * percentage * percentage 
          : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * easing);

        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 shrink-0">
      <Button
        size="lg"
        className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg h-16 px-10 rounded-2xl shadow-xl shadow-emerald-500/20 font-black transition-all hover:-translate-y-1"
        asChild
      >
        <Link href="/cadastro">
          {t("createAccount")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="border-white/20 text-white hover:text-white hover:bg-white/10 text-lg h-16 px-10 rounded-2xl bg-white/5 backdrop-blur-md font-bold transition-all hover:-translate-y-1"
        asChild
      >
        <a href="#como-funciona" onClick={scrollToSection}>
          {t("howItWorks")}
        </a>
      </Button>
    </div>
  );
}
