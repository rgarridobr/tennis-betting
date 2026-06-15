"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface State {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

interface StateCitySelectorProps {
  selectedState: string;
  selectedCity: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  required?: boolean;
  layout?: "vertical" | "grid";
}

export function StateCitySelector({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  required = false,
  layout = "vertical",
}: StateCitySelectorProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  // Fetch States
  useEffect(() => {
    async function fetchStates() {
      setLoadingStates(true);
      try {
        const response = await fetch("/api/locations/states");
        if (!response.ok) {
          throw new Error(`States API responded with status ${response.status}`);
        }
        const data: State[] = await response.json();
        const sorted = data.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR"),
        );
        setStates(sorted);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setLoadingStates(false);
      }
    }
    fetchStates();
  }, []);

  // Fetch Cities when State changes
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }

    async function fetchCities() {
      setLoadingCities(true);
      try {
        const response = await fetch(`/api/locations/states/${selectedState}/cities`);
        if (!response.ok) {
          throw new Error(`Cities API responded with status ${response.status}`);
        }
        const data: City[] = await response.json();
        const sorted = data.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR"),
        );
        setCities(sorted);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingCities(false);
      }
    }
    fetchCities();
  }, [selectedState]);

  return (
    <div
      className={
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
          : "flex flex-col gap-4"
      }
    >
      <div className="space-y-2">
        <Label htmlFor="state">Estado {required && "*"}</Label>
        <Popover modal={true} open={openState} onOpenChange={setOpenState}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openState}
              className="w-full justify-between overflow-hidden"
              disabled={loadingStates}
            >
              <span className="truncate flex-1 text-left">
                {loadingStates ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                ) : selectedState ? (
                  states.find((state) => state.sigla === selectedState)?.nome
                ) : (
                  "Selecione o estado..."
                )}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Buscar estado..." />
              <CommandList>
                <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                <CommandGroup>
                  {states.map((state) => (
                    <CommandItem
                      key={state.id}
                      value={state.nome}
                      onSelect={() => {
                        onStateChange(state.sigla);
                        onCityChange(""); // Reset city when state changes
                        setOpenState(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedState === state.sigla
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {state.nome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input
          type="hidden"
          name="state"
          value={selectedState}
          required={required}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Cidade {required && "*"}</Label>
        <Popover modal={true} open={openCity} onOpenChange={setOpenCity}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCity}
              className="w-full justify-between overflow-hidden"
              disabled={!selectedState || loadingCities}
            >
              <span className="truncate flex-1 text-left">
                {loadingCities ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                ) : selectedCity ? (
                  cities.find((city) => city.nome === selectedCity)?.nome ||
                  selectedCity
                ) : !selectedState ? (
                  "Selecione um estado"
                ) : (
                  "Selecione a cidade..."
                )}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Buscar cidade..." />
              <CommandList>
                <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.nome}
                      onSelect={(currentValue) => {
                        // currentValue is lowercased by CommandItem, but we want the original city.nome
                        onCityChange(city.nome);
                        setOpenCity(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCity === city.nome
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {city.nome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input
          type="hidden"
          name="city"
          value={selectedCity}
          required={required}
        />
      </div>
    </div>
  );
}
