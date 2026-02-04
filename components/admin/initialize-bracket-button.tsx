'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { initializeBracket } from '@/lib/actions/bracket'

interface InitializeBracketButtonProps {
  tournamentId: number
}

export function InitializeBracketButton({ tournamentId }: InitializeBracketButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setIsLoading(true)
    setError(null)
    
    const result = await initializeBracket(tournamentId)
    
    setIsLoading(false)
    
    if (!result.success) {
      setError(result.error || 'Erro ao inicializar chaveamento')
    }
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleClick}
        disabled={isLoading}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Criando...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Inicializar Chaveamento (64 partidas)
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
