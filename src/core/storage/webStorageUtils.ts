import webStorage from './webStorage'

export const DESKTOP_FOLDERS_STORAGE_KEY = 'webskop:desktop-folders'

export const FOLDER_ICON_COLOR_STORAGE_KEY = 'webskop:folder-icon-color'

/** Default matches favicon accent (`public/favicon.svg`). */
export const DEFAULT_FOLDER_ICON_COLOR = '#f4c9ed'

const FOLDER_ICON_COLOR_HEX6 = /^#[0-9A-Fa-f]{6}$/
const FOLDER_ICON_COLOR_HEX3 = /^#[0-9A-Fa-f]{3}$/

export function normalizeFolderIconColorHex(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_FOLDER_ICON_COLOR
  const s = raw.trim()
  if (FOLDER_ICON_COLOR_HEX6.test(s)) return s.toLowerCase()
  if (FOLDER_ICON_COLOR_HEX3.test(s)) {
    const r = s[1]
    const g = s[2]
    const b = s[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return DEFAULT_FOLDER_ICON_COLOR
}

export function loadFolderIconColor(): string {
  const stored = webStorage.local.getItem<unknown>(FOLDER_ICON_COLOR_STORAGE_KEY)
  return normalizeFolderIconColorHex(stored)
}

export function saveFolderIconColor(hex: string): void {
  webStorage.local.setItem(
    FOLDER_ICON_COLOR_STORAGE_KEY,
    normalizeFolderIconColorHex(hex),
  )
}

export type DesktopLinkRecord = {
  id: string
  url: string
  label: string
  x: number
  y: number
  previewImageUrl?: string
}

export type DesktopFolderRecord = {
  id: string
  label: string
  x: number
  y: number
  links: DesktopLinkRecord[]
}

export type DesktopItem = DesktopFolderRecord

function normalizeFolder(raw: unknown): DesktopFolderRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.label !== 'string') return null
  if (typeof o.x !== 'number' || typeof o.y !== 'number') return null
  let links: DesktopLinkRecord[] = []
  if (Array.isArray(o.links)) {
    links = o.links
      .map(function normalizeLink(entry): DesktopLinkRecord | null {
        if (!entry || typeof entry !== 'object') return null
        const L = entry as Record<string, unknown>
        if (typeof L.id !== 'string' || typeof L.url !== 'string') return null
        if (typeof L.label !== 'string' || typeof L.x !== 'number' || typeof L.y !== 'number') {
          return null
        }
        const preview =
          typeof L.previewImageUrl === 'string' ? L.previewImageUrl : undefined
        return {
          id: L.id,
          url: L.url,
          label: L.label,
          x: L.x,
          y: L.y,
          previewImageUrl: preview,
        }
      })
      .filter(function isLink(x): x is DesktopLinkRecord {
        return x !== null
      })
  }
  return {
    id: o.id,
    label: o.label,
    x: o.x,
    y: o.y,
    links,
  }
}

export function saveFolder(items: DesktopFolderRecord[]): void {
  webStorage.local.setItem(DESKTOP_FOLDERS_STORAGE_KEY, items)
}

export function loadFolders(): DesktopFolderRecord[] | null {
  const stored = webStorage.local.getItem<unknown[]>(DESKTOP_FOLDERS_STORAGE_KEY)
  if (!stored || !Array.isArray(stored)) {
    return null
  }
  const normalized = stored
    .map(normalizeFolder)
    .filter(function isFolder(f): f is DesktopFolderRecord {
      return f !== null
    })
  return normalized.length ? normalized : null
}
