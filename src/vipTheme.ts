const VIP_BADGE_BG_BY_LEVEL: Record<number, string> = {
  1: 'bg-orange-400',
  2: 'bg-cyan-400',
  3: 'bg-blue-600',
  4: 'bg-orange-500',
  5: 'bg-yellow-500',
};

export function getVipBadgeBgClass(level: number | string | null | undefined): string {
  const normalizedLevel = Number(level) || 1;
  return VIP_BADGE_BG_BY_LEVEL[normalizedLevel] || 'bg-yellow-500';
}
