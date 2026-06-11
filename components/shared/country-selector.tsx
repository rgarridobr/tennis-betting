'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Country {
  name: string;
  code: string;
}

interface LocalizedCountry extends Country {
  displayName: string;
}

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  required?: boolean;
  label?: string;
}

export function CountrySelector({
  selectedCountry,
  onCountryChange,
  required = false,
  label = 'País',
}: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [open, setOpen] = useState(false);
  const displayNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['pt-BR'], { type: 'region' })
    : null;

  const localizedCountries = useMemo<LocalizedCountry[]>(() => {
    return countries.map((country) => {
      const localizedName = displayNames?.of(country.code.toUpperCase()) || country.name;
      return {
        ...country,
        displayName: localizedName || country.name,
      };
    });
  }, [countries, displayNames]);

  useEffect(() => {
    async function fetchCountries() {
      setLoading(true);
      setLoadError(false);

      try {
        const response = await fetch('/api/countries');
        if (!response.ok) {
          throw new Error('Erro ao carregar países');
        }

        const data = await response.json();
        const parsedCountries: Country[] = Array.isArray(data)
          ? data
              .map((item: any) => ({
                name: item?.name ?? '',
                code: item?.code ?? '',
              }))
              .filter((item) => item.name && item.code)
          : [];

        setCountries(parsedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  const sortedCountries = useMemo(() => {
    return [...localizedCountries].sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
  }, [localizedCountries]);

  const selectedLabel =
    selectedCountry || (loading ? 'Carregando países...' : 'Selecione o país...');

  if (loadError) {
    return (
      <div className="space-y-2">
        <Label htmlFor="country">{label} {required && '*'}</Label>
        <Input
          id="country"
          name="country"
          placeholder="Brasil"
          value={selectedCountry}
          onChange={(event) => onCountryChange(event.target.value)}
          required={required}
        />
        <p className="text-sm text-slate-500">Não foi possível carregar a lista de países. Informe o país manualmente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="country">{label} {required && '*'}</Label>
      <input type="hidden" name="country" value={selectedCountry || ''} />
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            id="country"
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-12 w-full justify-between rounded-2xl border-slate-200 bg-white px-3 text-left text-slate-700 hover:bg-white',
              !selectedCountry && 'text-slate-400',
            )}
            disabled={loading}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] rounded-2xl p-0" align="start">
          <Command className="rounded-2xl">
            <CommandInput placeholder="Buscar país..." />
            <CommandList className="max-h-72 overscroll-contain">
              <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
              <CommandGroup>
                {sortedCountries.map((country) => (
                  <CommandItem
                    key={country.code || country.name}
                    value={country.displayName}
                    onSelect={() => {
                      onCountryChange(country.displayName);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCountry === country.displayName ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {country.displayName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
