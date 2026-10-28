// Level threshold formula: threshold(n) = 50 * n * (n - 1)
// L1=0, L2=100, L3=300, L4=600, L5=1000, L6=1500 …

export function thresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * level * (level - 1);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (thresholdForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function xpForNextLevel(currentLevel: number): number {
  return thresholdForLevel(currentLevel + 1);
}

export function xpProgressInCurrentLevel(
  xp: number,
  level: number
): { current: number; needed: number; percent: number } {
  const levelStart = thresholdForLevel(level);
  const levelEnd = thresholdForLevel(level + 1);
  const current = xp - levelStart;
  const needed = levelEnd - levelStart;
  return {
    current,
    needed,
    percent: Math.min(100, Math.round((current / needed) * 100)),
  };
}
