'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { StateCitySelector } from '@/components/shared/state-city-selector'
import { TennisClubSelector } from '@/components/shared/tennis-club-selector'
import { CountrySelector } from '@/components/shared/country-selector'
import { updateProfile } from '@/lib/actions/profile'
import type { TennisClub } from '@/lib/data'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ProfileEditFormProps {
  clubs: TennisClub[]
  user: {
    id: number
    name: string
    email: string
    nickname?: string
    tennis_club?: string
    tennis_club_id?: number | null
    tennis_club_custom?: string | null
    country?: string
    state?: string
    city?: string
  }
}

export function ProfileEditForm({ user, clubs }: ProfileEditFormProps) {
  const t = useTranslations('profile')
  const tButtons = useTranslations('buttons')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(user.name)
  const [nickname, setNickname] = useState(user.nickname || '')
  const [tennisClub, setTennisClub] = useState(user.tennis_club || '')
  const [country, setCountry] = useState(user.country || 'Brasil')
  const [state, setState] = useState(user.state || '')
  const [city, setCity] = useState(user.city || '')
  const [isFirstNameOnlyChecked, setIsFirstNameOnlyChecked] = useState(false)
  const isBrazil = ['brasil', 'brazil'].includes(country.trim().toLowerCase())

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (isFirstNameOnlyChecked) {
      const firstName = value.trim().split(' ')[0]
      setNickname(firstName)
    }
  }

  const handleFirstNameOnlyChange = (checked: boolean) => {
    setIsFirstNameOnlyChecked(checked)
    if (checked) {
      const firstName = name.trim().split(' ')[0]
      setNickname(firstName)
    }
  }

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleProfileSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setMessage({ type: 'success', text: t('editSuccess') })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || t('editError') })
      }
    } catch {
      setMessage({ type: 'error', text: t('editError') })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Profile Info Form */}
      <form action={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder=""
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              name="email"
              type="text"
              defaultValue={user.email}
              disabled
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] sm:text-xs text-slate-500 px-1">{t('emailLocked')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">{t('nickname')}</Label>
            <Input
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              readOnly={isFirstNameOnlyChecked}
              className={isFirstNameOnlyChecked ? 'bg-slate-50 cursor-not-allowed' : ''}
              placeholder=""
            />
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 px-1">
              <p className="text-[10px] sm:text-xs text-slate-500 flex-1">
                {t('nicknameHint')}
              </p>
              <div className="flex items-center space-x-2 shrink-0">
                <Checkbox
                  id="first_name_only_profile"
                  checked={isFirstNameOnlyChecked}
                  onCheckedChange={handleFirstNameOnlyChange}
                />
                <Label
                  htmlFor="first_name_only_profile"
                  className="text-[10px] sm:text-xs font-medium cursor-pointer"
                >
                  {t('useFirstName')}
                </Label>
              </div>
            </div>
          </div>

          <CountrySelector
            selectedCountry={country}
            onCountryChange={(value) => {
              setCountry(value)
              if (!['brasil', 'brazil'].includes(value.trim().toLowerCase())) {
                setState('')
                setCity('')
              }
            }}
            required
          />

          <TennisClubSelector
            clubs={clubs}
            value={tennisClub}
            onChange={setTennisClub}
            clubId={user.tennis_club_id}
            customClub={user.tennis_club_custom}
            required
          />

          <div className="md:col-span-2">
            {isBrazil ? (
              <StateCitySelector
                selectedState={state}
                selectedCity={city}
                onStateChange={setState}
                onCityChange={setCity}
                required
                layout="grid"
              />
            ) : (
              <p className="text-sm text-slate-500">{t('noStateCity')}</p>
            )}
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        <Button 
          type="submit" 
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tButtons('saving')}
            </>
          ) : (
            t('save')
          )}
        </Button>
      </form>
    </div>
  )
}
