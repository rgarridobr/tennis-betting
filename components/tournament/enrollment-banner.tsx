'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle } from 'lucide-react';
import { EnrollmentModal } from './enrollment-modal';
import type { Tournament } from '@/lib/data';

interface EnrollmentBannerProps {
  tournament: Tournament;
  activeEnrollment?: Tournament | null;
}

export function EnrollmentBanner({ tournament, activeEnrollment }: EnrollmentBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (activeEnrollment && activeEnrollment.id !== tournament.id) {
    return (
      <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-amber-100">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Inscrição Restrita</h3>
              <p className="text-slate-600 mt-1">
                Você já está participando do torneio <strong>{activeEnrollment.name}</strong>. Pelas regras do bolão,
                você só pode disputar um torneio de cada vez. Você poderá se inscrever em novos torneios assim que o
                atual for finalizado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <h3 className="font-bold text-lg text-slate-900">Participe do Bolão!</h3>
                <p className="text-slate-600 mt-1">
                  Inscreva-se para fazer seus palpites no chaveamento completo do {tournament.name}.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              Inscrever-se
            </Button>
          </div>
        </CardContent>
      </Card>

      <EnrollmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tournament={tournament} />
    </>
  );
}
