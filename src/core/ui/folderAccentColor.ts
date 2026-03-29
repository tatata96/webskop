/**
 * Stable accent per folder id: same id always maps to the same swatch.
 * Vivid palette (inspired by classic high-contrast UI accents).
 */
const FOLDER_ACCENT_PALETTE = [
  /* Vibrant Coral */ '#FF595E',
  /* Golden Pollen */ '#FFCA3A',
  /* Yellow Green */ '#8AC926',
  /* Steel Blue */ '#1982C4',
  /* Dusty Grape */ '#6A4C93',
] as const

export function folderAccentColor(folderId: string): string {
  let hash = 0
  for (let i = 0; i < folderId.length; i += 1) {
    hash = Math.imul(31, hash) + folderId.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % FOLDER_ACCENT_PALETTE.length
  return FOLDER_ACCENT_PALETTE[index]
}
