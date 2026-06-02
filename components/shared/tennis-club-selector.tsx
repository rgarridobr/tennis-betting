'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TennisClub } from '@/lib/data';
import { cn } from '@/lib/utils';

const NO_CLUB_VALUE = 'Nenhum';
const OTHER_VALUE = '__other__';

interface TennisClubSelectorProps {
  clubs: TennisClub[];
  value: string;
  onChange: (value: string) => void;
  clubId?: number | null;
  customClub?: string | null;
  label?: string;
  required?: boolean;
}

export function TennisClubSelector({
  clubs,
  value,
  onChange,
  clubId,
  customClub,
  label = 'Clube em que joga tênis *',
  required = true,
}: TennisClubSelectorProps) {
  const knownClubNames = useMemo(() => new Set(clubs.map((club) => club.name)), [clubs]);
  const isKnownClub = value === NO_CLUB_VALUE || knownClubNames.has(value);
  const initialSelectedValue = clubId
    ? `club:${clubId}`
    : customClub || (!isKnownClub && value)
      ? OTHER_VALUE
      : value || '';
  const initialOtherClub = customClub || (!isKnownClub ? value : '');
  const [selectedValue, setSelectedValue] = useState(initialSelectedValue);
  const [otherClub, setOtherClub] = useState(initialOtherClub);
  const [open, setOpen] = useState(false);
  const selectedClub = selectedValue.startsWith('club:')
    ? clubs.find((club) => `club:${club.id}` === selectedValue)
    : null;
  const selectedLabel =
    selectedValue === OTHER_VALUE
      ? 'Outro clube'
      : selectedClub?.name || selectedValue || 'Selecione seu clube';

  const selectedClubId = selectedClub?.id || '';
  const selectedCustomClub = selectedValue === OTHER_VALUE ? otherClub : '';

  function handleSelectChange(nextValue: string) {
    setSelectedValue(nextValue);
    setOpen(false);

    if (nextValue === OTHER_VALUE) {
      onChange(otherClub);
      return;
    }

    setOtherClub('');
    if (nextValue.startsWith('club:')) {
      const club = clubs.find((item) => `club:${item.id}` === nextValue);
      onChange(club?.name || '');
      return;
    }

    onChange(nextValue);
  }

  function handleOtherChange(nextValue: string) {
    setOtherClub(nextValue);
    onChange(nextValue);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="tennis_club_select">{label}</Label>
      <input type="hidden" name="tennis_club" value={value} />
      <input type="hidden" name="tennis_club_id" value={selectedClubId} />
      <input type="hidden" name="tennis_club_custom" value={selectedCustomClub} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="tennis_club_select"
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-12 w-full justify-between rounded-2xl border-slate-200 bg-white px-3 font-bold text-slate-700 hover:bg-white',
              !selectedValue && 'text-slate-400',
            )}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] rounded-2xl p-0"
          align="start"
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          <Command className="rounded-2xl">
            <CommandInput placeholder="Digite para buscar o clube..." />
            <CommandList
              className="max-h-72 overscroll-contain"
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
            >
              <CommandEmpty>Nenhum clube encontrado.</CommandEmpty>
              <CommandGroup>
                <CommandItem value={NO_CLUB_VALUE} onSelect={() => handleSelectChange(NO_CLUB_VALUE)}>
                  <Check className={cn('mr-2 h-4 w-4', selectedValue === NO_CLUB_VALUE ? 'opacity-100' : 'opacity-0')} />
                  Não joga em nenhum clube
                </CommandItem>
                {clubs.map((club) => (
                  <CommandItem key={club.id} value={club.name} onSelect={() => handleSelectChange(`club:${club.id}`)}>
                    <Check className={cn('mr-2 h-4 w-4', selectedValue === `club:${club.id}` ? 'opacity-100' : 'opacity-0')} />
                    {club.name}
                  </CommandItem>
                ))}
                <CommandItem value="Outro clube" onSelect={() => handleSelectChange(OTHER_VALUE)}>
                  <Check className={cn('mr-2 h-4 w-4', selectedValue === OTHER_VALUE ? 'opacity-100' : 'opacity-0')} />
                  Outro clube
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedValue === OTHER_VALUE && (
        <Input
          value={otherClub}
          onChange={(event) => handleOtherChange(event.target.value)}
          placeholder="Digite o nome do clube"
          className="h-12 rounded-2xl border-slate-200 bg-white"
          required={required}
        />
      )}
    </div>
  );
}
