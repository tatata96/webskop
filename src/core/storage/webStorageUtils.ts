import webStorage from './webStorage'

export const DESKTOP_FOLDERS_STORAGE_KEY = 'webskop:desktop-folders'

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
