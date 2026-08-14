const ptBrCollator = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  ignorePunctuation: true,
  numeric: true,
});

export function comparePtBrText(a: string | null | undefined, b: string | null | undefined): number {
  return ptBrCollator.compare((a ?? '').trim(), (b ?? '').trim());
}

export function sortByPtBrText<T>(
  items: T[],
  getValue: (item: T) => string | null | undefined,
): T[] {
  return [...items].sort((a, b) => comparePtBrText(getValue(a), getValue(b)));
}
