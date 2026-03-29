import webStorage from './webStorage'

export const DESKTOP_FOLDERS_STORAGE_KEY = 'webskop:desktop-folders'

export type DesktopFolderRecord = {
  id: string
  label: string
  x: number
  y: number
}

export function saveFolder(items: DesktopFolderRecord[]): void {
  webStorage.local.setItem(DESKTOP_FOLDERS_STORAGE_KEY, items)
}

export function loadFolders(): DesktopFolderRecord[] | null {
  const stored = webStorage.local.getItem<DesktopFolderRecord[]>(DESKTOP_FOLDERS_STORAGE_KEY)
  if (!stored || !Array.isArray(stored)) {
    return null
  }
  return stored
}
