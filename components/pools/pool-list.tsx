"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Lock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Pool } from "@/lib/data";
import { useRouter } from "next/navigation";

interface PoolListProps {
  myPools: Pool[];
  generalPools: Pool[];
  initialSearchResults: Pool[];
}

export function PoolList({ myPools, generalPools, initialSearchResults: searchResults }: PoolListProps) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    // In a real app, this would be a server action or API call
    // For now, we'll use a simple filter if we were on the client,
    // but we want to encourage server-side search.
    // For the sake of this implementation, we'll redirect to the same page with a query param
    router.push(`/boloes?q=${encodeURIComponent(search)}`);
    setIsSearching(false);
  };

  return (
    <div className="space-y-12">
      {/* Search Section */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-500" />
          Encontrar um Bolão Privado
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Digite o nome do bolão (ex: Bolão do Clube Militar)"
              className="pl-12 h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold" disabled={isSearching}>
            Buscar
          </Button>
        </form>

        {searchResults.length > 0 && search && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}
      </section>

      {/* My Pools */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D32D18]" />
            Meus Bolões
          </h2>
          <Button asChild className="bg-[#6EC46C] hover:bg-[#6EC46C]/90 rounded-xl font-bold">
            <Link href="/boloes/novo">Criar Novo Bolão</Link>
          </Button>
        </div>
        {myPools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} isMember={true} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 rounded-3xl p-12 text-center">
            <p className="text-slate-500 font-medium">Você ainda não participa de nenhum bolão.</p>
            <p className="text-slate-400 text-sm mt-1">Crie o seu próprio ou busque por um existente.</p>
          </div>
        )}
      </section>

      {/* General Pools */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Bolões Gerais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generalPools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PoolCard({ pool, isMember }: { pool: Pool; isMember?: boolean }) {
  return (
    <Link href={`/boloes/${pool.id}`} className="group block">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-emerald-500/30 hover:shadow-md transition-all h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
            {pool.is_general ? (
              <Trophy className="w-6 h-6 text-amber-500" />
            ) : (
              <Users className="w-6 h-6 text-emerald-500" />
            )}
          </div>
          {pool.password_hash && !pool.is_general && (
            <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg" title="Requer senha">
              <Lock className="w-4 h-4" />
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {pool.name}
        </h3>

        <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
          {pool.description || "Sem descrição disponível."}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Users className="w-4 h-4" />
            <span>{pool.member_count} {pool.member_count === 1 ? 'membro' : 'membros'}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
            {isMember ? "Ver Ranking" : "Entrar"}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
