import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation helpers.
 * Prefer these over next/link and next/navigation in UI components
 * so locale prefixes stay consistent.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
