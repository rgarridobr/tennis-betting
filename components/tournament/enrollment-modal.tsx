'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Trophy, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    id: number;
    name: string;
  };
}

export function EnrollmentModal({ isOpen, onClose, tournament }: EnrollmentModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'processing' | 'success'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEnroll = async () => {
    setIsProcessing(true);
    setStep('processing');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tournament/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: tournament.id }),
      });

      if (response.ok) {
        setStep('success');
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Erro ao realizar inscrição');
        setStep('info');
      }
    } catch {
      setErrorMessage('Erro de conexão ao realizar inscrição');
      setStep('info');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (step !== 'processing') {
      setStep('info');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'info' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Participar do Bolão
              </DialogTitle>
              <DialogDescription>
                Inscreva-se no bolão de {tournament.name} e dispute com outros participantes!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Separator />
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-600">1</span>
                  </div>
                  <p>Confirme sua inscrição no botão abaixo para entrar na disputa deste torneio.</p>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-600">2</span>
                  </div>
                  <p>Após inscrito, você poderá iniciar os palpites nos jogos já confirmados.</p>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-600">3</span>
                  </div>
                  <p>
                    Assim que os classificados no qualifying forem inseridos na chave principal do torneio, pode-se
                    completar os palpites do bolão.
                  </p>
                </div>

                <div className="flex items-start gap-3 text-amber-600 font-medium">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">!</span>
                  </div>
                  <p className="text-xs">
                    Importante: Você só pode participar de um torneio por vez. Novos torneios só serão liberados após a
                    conclusão do atual.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                    {errorMessage}
                  </div>
                )}

                <Link
                  href="/regras"
                  className="flex items-center gap-2 text-emerald-600 font-bold hover:underline mt-4"
                >
                  <FileText className="w-4 h-4" />
                  Ver regras completas de pontuação
                </Link>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleEnroll} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                Inscrever-se
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-emerald-600 animate-spin mb-4" />
            <p className="font-semibold text-lg text-slate-900">Processando inscrição...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-semibold text-lg text-emerald-600">Inscrição confirmada!</p>
            <p className="text-sm text-slate-500 mt-1">Agora você pode fazer seus palpites</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
