import type { DesktopItem, DesktopLinkRecord } from '../core/storage/webStorageUtils'

export type DesktopSearchResult = {
  id: string
  kind: 'link'
  folderId: string
  folderLabel: string
  linkId: string
  linkLabel: string
  linkUrl: string
}

type UseDesktopSearchArgs = {
  items: DesktopItem[]
  openFolderId: string | null
  searchQuery: string
}

type UseDesktopSearchResult = {
  openFolder: DesktopItem | null
  hasSearchQuery: boolean
  visibleFolders: DesktopItem[]
  visibleLinks: DesktopLinkRecord[]
  globalLinkResults: DesktopSearchResult[]
}

export function useDesktopSearch({
  items,
  openFolderId,
  searchQuery,
}: UseDesktopSearchArgs): UseDesktopSearchResult {
  const openFolder = openFolderId
    ? items.find((folder) => folder.id === openFolderId) ?? null
    : null
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const hasSearchQuery = normalizedSearchQuery.length > 0

  const visibleFolders = hasSearchQuery
    ? items.filter((folder) => {
        return folder.label.toLowerCase().includes(normalizedSearchQuery)
      })
    : items

  const visibleLinks = hasSearchQuery && openFolder
    ? openFolder.links.filter((link) => {
        return (
          link.label.toLowerCase().includes(normalizedSearchQuery) ||
          link.url.toLowerCase().includes(normalizedSearchQuery)
        )
      })
    : openFolder?.links ?? []

  const globalLinkResults: DesktopSearchResult[] = openFolderId === null && hasSearchQuery
    ? items.flatMap((folder) => {
        return folder.links
          .filter((link) => {
            return (
              link.label.toLowerCase().includes(normalizedSearchQuery) ||
              link.url.toLowerCase().includes(normalizedSearchQuery) ||
              folder.label.toLowerCase().includes(normalizedSearchQuery)
            )
          })
          .map((link) => {
            return {
              id: `${folder.id}:${link.id}`,
              kind: 'link',
              folderId: folder.id,
              folderLabel: folder.label,
              linkId: link.id,
              linkLabel: link.label,
              linkUrl: link.url,
            }
          })
      })
    : []

  return {
    openFolder,
    hasSearchQuery,
    visibleFolders,
    visibleLinks,
    globalLinkResults,
  }
}