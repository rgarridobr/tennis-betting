'use client';

import { useId, useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export function PasswordInput({ id, className, disabled, ...props }: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('common');
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        autoCapitalize="none"
        spellCheck={false}
        {...props}
        id={inputId}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
        className={cn(className, 'pr-12 [&::-ms-reveal]:hidden')}
      />
      <button
        type="button"
        aria-controls={inputId}
        aria-label={t(isVisible ? 'hidePassword' : 'showPassword')}
        disabled={disabled}
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute end-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
      >
        <Icon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
