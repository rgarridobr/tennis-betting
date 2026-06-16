'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, MessageCircle, Search, ShieldCheck, UserX } from 'lucide-react';
import type { TournamentParticipantAuditEntry } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  participants: TournamentParticipantAuditEntry[];
  totalMatches: number;
  tournamentId: number;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatLastPrediction(date: string | null) {
  if (!date) return 'Sem envio';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function getWhatsappLink(participant: TournamentParticipantAuditEntry, tournamentUrl: string) {
  if (!participant.whatsapp) return null;

  const phone = participant.whatsapp.replace(/\D/g, '');
  if (!phone) return null;
  const normalizedPhone = phone.length <= 11 ? `55${phone}` : phone;

  const message = `Oi, ${participant.user_name}! Tudo bem? Você está inscrito no torneio, mas ainda não enviou seus palpites. Quando puder, acesse o link abaixo e preencha sua chave para garantir sua participação:\n\n${tournamentUrl}\n\nObrigado!`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

function ParticipantRow({
  participant,
  totalMatches,
  tournamentUrl,
}: {
  participant: TournamentParticipantAuditEntry;
  totalMatches: number;
  tournamentUrl: string;
}) {
  const progress = totalMatches > 0 ? Math.round((participant.prediction_count / totalMatches) * 100) : 0;
  const hasPredictions = participant.prediction_count > 0;
  const isComplete = totalMatches > 0 && participant.prediction_count >= totalMatches;
  const whatsappLink = getWhatsappLink(participant, tournamentUrl);

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          {hasPredictions ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <UserX className="size-4 shrink-0 text-rose-500" />
          )}
          <p className="truncate text-sm font-black text-slate-900">{participant.user_name}</p>
          {isComplete && (
            <Badge className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
              Completo
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
          <span className="truncate">{participant.email}</span>
          {participant.tennis_club && <span className="truncate">{participant.tennis_club}</span>}
          <span>{formatLastPrediction(participant.last_prediction_at)}</span>
        </div>
      </div>

      <div className="grid w-full gap-3 sm:w-52">
        <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-700">
          <span>
            {participant.prediction_count}/{totalMatches}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={hasPredictions ? 'h-full rounded-full bg-emerald-500' : 'h-full rounded-full bg-rose-400'}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {!hasPredictions &&
          (whatsappLink ? (
            <Button variant="outline" size="sm" asChild className="h-8 justify-self-start border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 sm:justify-self-end">
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
          ) : (
            <Badge className="w-fit justify-self-start rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500 sm:justify-self-end">
              Sem WhatsApp
            </Badge>
          ))}
      </div>
    </div>
  );
}

function ParticipantList({
  participants,
  totalMatches,
  emptyText,
  tournamentUrl,
}: {
  participants: TournamentParticipantAuditEntry[];
  totalMatches: number;
  emptyText: string;
  tournamentUrl: string;
}) {
  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[420px] pr-3">
      <div className="space-y-2">
        {participants.map((participant) => (
          <ParticipantRow
            key={participant.user_id}
            participant={participant}
            totalMatches={totalMatches}
            tournamentUrl={tournamentUrl}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

export function TournamentParticipantsAudit({ participants, totalMatches, tournamentId }: Props) {
  const [query, setQuery] = useState('');
  const [origin, setOrigin] = useState('');
  const submitted = participants.filter((participant) => participant.prediction_count > 0);
  const pending = participants.filter((participant) => participant.prediction_count === 0);
  const complete = participants.filter((participant) => totalMatches > 0 && participant.prediction_count >= totalMatches);
  const completionRate = participants.length > 0 ? Math.round((submitted.length / participants.length) * 100) : 0;
  const tournamentUrl = `${origin}/torneios/${tournamentId}`;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const filteredParticipants = useMemo(() => {
    const search = normalize(query.trim());
    if (!search) return { submitted, pending };

    const matchesSearch = (participant: TournamentParticipantAuditEntry) =>
      normalize(
        [
          participant.user_name,
          participant.email,
          participant.nickname ?? '',
          participant.whatsapp ?? '',
          participant.tennis_club ?? '',
        ].join(' '),
      ).includes(search);

    return {
      submitted: submitted.filter(matchesSearch),
      pending: pending.filter(matchesSearch),
    };
  }, [pending, query, submitted]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white">
          <ShieldCheck className="size-4" />
          Inscritos
          <Badge className="ml-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-white">
            {submitted.length}/{participants.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden border-slate-200 p-0 sm:max-w-4xl">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
              <ClipboardList className="size-5 text-emerald-600" />
              Auditoria de inscritos
            </DialogTitle>
            <DialogDescription>
              Veja quem enviou palpites, quem ainda não enviou e o quanto cada inscrito preencheu da chave.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-black uppercase text-slate-500">Inscritos</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{participants.length}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-black uppercase text-emerald-700">Palpitaram</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{submitted.length}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-black uppercase text-rose-700">Sem palpites</p>
              <p className="mt-1 text-2xl font-black text-rose-700">{pending.length}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-black uppercase text-blue-700">Cobertura</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome, email, clube ou WhatsApp"
                className="pl-9"
              />
            </div>
          </div>

          <Tabs defaultValue="submitted" className="gap-4">
            <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg bg-slate-100">
              <TabsTrigger value="submitted" className="font-black">
                Palpitaram ({filteredParticipants.submitted.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="font-black">
                Sem palpites ({filteredParticipants.pending.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="submitted">
              <ParticipantList
                participants={filteredParticipants.submitted}
                totalMatches={totalMatches}
                tournamentUrl={tournamentUrl}
                emptyText="Nenhum inscrito com palpites encontrado para essa busca."
              />
            </TabsContent>
            <TabsContent value="pending">
              <ParticipantList
                participants={filteredParticipants.pending}
                totalMatches={totalMatches}
                tournamentUrl={tournamentUrl}
                emptyText="Nenhum inscrito sem palpites encontrado para essa busca."
              />
            </TabsContent>
          </Tabs>

          <p className="mt-4 text-xs font-semibold text-slate-500">
            {complete.length} inscrito(s) preencheram todos os {totalMatches} jogos da chave.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
