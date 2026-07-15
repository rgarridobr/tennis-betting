'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { EnrollmentModal } from './enrollment-modal';
import type { Tournament } from '@/lib/data';
import { useTranslations } from 'next-intl';

interface EnrollmentBannerProps {
  tournament: Tournament;
}

export function EnrollmentBanner({ tournament }: EnrollmentBannerProps) {
  const t = useTranslations('tournaments');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="mb-6 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-emerald-100">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{t('enrollBannerTitle')}</h3>
                <p className="text-slate-600 mt-1">
                  {t('enrollBannerBody', { name: tournament.name })}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              {t('enrollCta')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <EnrollmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tournament={tournament} />
    </>
  );
}
