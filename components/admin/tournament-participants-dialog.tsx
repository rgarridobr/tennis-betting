'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Mail, Search, UserRound, Users } from 'lucide-react';
import type { TournamentParticipantEntry } from '@/lib/data';
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
import { useLocale, useTranslations } from 'next-intl';

interface Props {
  participants: TournamentParticipantEntry[];
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatEnrollmentDate(date: string | null, locale: string) {
  if (!date) return null;

  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function TournamentParticipantsDialog({ participants }: Props) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [query, setQuery] = useState('');

  const filteredParticipants = useMemo(() => {
    const search = normalize(query.trim());
    if (!search) return participants;

    return participants.filter((participant) =>
      normalize(
        [
          participant.user_name,
          participant.email,
          participant.nickname ?? '',
          participant.whatsapp ?? '',
          participant.tennis_club ?? '',
        ].join(' '),
      ).includes(search),
    );
  }, [participants, query]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white">
          <Users className="size-4" />
          {t('participantsDialog.enrolled')}
          <Badge className="ml-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-white">
            {participants.length}
          </Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-hidden border-slate-200 p-0 sm:max-w-2xl">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
              <Users className="size-5 text-emerald-600" />
              {t('participantsDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {participants.length === 1
                ? t('participantsDialog.countOne')
                : t('participantsDialog.countOther', { count: participants.length })}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('participantsDialog.searchPlaceholder')}
              className="pl-9"
            />
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
              {participants.length === 0
                ? t('participantsDialog.empty')
                : t('participantsDialog.notFound')}
            </div>
          ) : (
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-2">
                {filteredParticipants.map((participant) => {
                  const enrollmentDate = formatEnrollmentDate(participant.joined_at, locale);

                  return (
                    <div
                      key={participant.user_id}
                      className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <UserRound className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">{participant.user_name}</p>
                        <div className="mt-1 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                          <span className="flex min-w-0 items-center gap-1">
                            <Mail className="size-3.5 shrink-0" />
                            <span className="truncate">{participant.email}</span>
                          </span>
                          {participant.tennis_club && <span className="truncate">{participant.tennis_club}</span>}
                          {participant.whatsapp && <span>{participant.whatsapp}</span>}
                          {enrollmentDate && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="size-3.5" />
                              {t('participantsDialog.enrolledOn', { date: enrollmentDate })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
