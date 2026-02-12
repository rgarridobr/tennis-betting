import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBrazilianPhoneNumber(value: string) {
  if (!value) return value
  const phoneNumber = value.replace(/\D/g, '')
  const phoneNumberLength = phoneNumber.length
  if (phoneNumberLength < 3) return phoneNumber
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`
  }
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`
}
