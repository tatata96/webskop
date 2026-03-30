import { useCallback, useEffect, useState, type SetStateAction } from 'react'
import type { DesktopItem, DesktopLinkRecord } from '../core/storage/webStorageUtils'
import {
  loadFolderIconColor,
  loadFolders,
  saveFolder,
  saveFolderIconColor,
} from '../core/storage/webStorageUtils'
import { useDesktopSearch, type DesktopSearchResult } from './useDesktopSearch'

const defaultDesktopItems: DesktopItem[] = [
  { id: '1', label: 'Test', x: 40, y: 40, links: [{ id: '1', url: 'https://www.google.com', label: 'Google', x: 40, y: 40 }] },
]

const ITEM_GAP_Y = 120
const ITEM_START_X = 40
const ITEM_START_Y = 40
const ITEM_COLUMN_SIZE = 5

type UseMainPageStateResult = {
  items: DesktopItem[]
  openFolderId: string | null
  folderSidebarOpen: boolean
  resourcesPageOpen: boolean
  folderIconColor: string
  searchQuery: string
  openFolder: DesktopItem | null
  hasSearchQuery: boolean
  visibleFolders: DesktopItem[]
  visibleLinks: DesktopLinkRecord[]
  globalLinkResults: DesktopSearchResult[]
  showFolderColorPicker: boolean
  searchPlaceholder: string
  searchDropdownOpen: boolean
  setSearchQuery: (value: string) => void
  handleToggleFolderList: () => void
  handleCloseFolderList: () => void
  handleCloseResources: () => void
  handleFolderSelect: (folderId: string) => void
  handleFolderLinksChange: (update: SetStateAction<DesktopLinkRecord[]>) => void
  handleAddItem: () => void
  handleFolderOpen: (folderId: string) => void
  handleGoHome: () => void
  handleToggleResources: () => void
  handleFoldersItemsChange: (next: DesktopItem[]) => void
  handleSearchResultSelect: (result: DesktopSearchResult) => void
  handleFolderIconColorChange: (color: string) => void
}

export function useMainPageState(): UseMainPageStateResult {
  const [items, setItems] = useState<DesktopItem[]>(
    () => loadFolders() ?? defaultDesktopItems,
  )
  const [openFolderId, setOpenFolderId] = useState<string | null>(null)
  const [folderSidebarOpen, setFolderSidebarOpen] = useState(false)
  const [resourcesPageOpen, setResourcesPageOpen] = useState(false)
  const [folderIconColor, setFolderIconColor] = useState(loadFolderIconColor)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    saveFolder(items)
  }, [items])

  useEffect(() => {
    saveFolderIconColor(folderIconColor)
  }, [folderIconColor])

  const {
    openFolder,
    hasSearchQuery,
    visibleFolders,
    visibleLinks,
    globalLinkResults,
  } = useDesktopSearch({
    items,
    openFolderId,
    searchQuery,
  })

  const handleToggleFolderList = useCallback(() => {
    setFolderSidebarOpen((open) => !open)
  }, [])

  const handleCloseFolderList = useCallback(() => {
    setFolderSidebarOpen(false)
  }, [])

  const handleCloseResources = useCallback(() => {
    setResourcesPageOpen(false)
  }, [])

  const handleFolderSelect = useCallback((folderId: string) => {
    setResourcesPageOpen(false)
    setOpenFolderId(folderId)
    setSearchQuery('')
  }, [])

  const handleFolderLinksChange = useCallback(
    (update: SetStateAction<DesktopLinkRecord[]>) => {
      if (!openFolderId) {
        return
      }
      setItems((prev) =>
        prev.map((folder) => {
          if (folder.id !== openFolderId) {
            return folder
          }

          const nextLinks =
            typeof update === 'function' ? update(folder.links) : update
          return { ...folder, links: nextLinks }
        }),
      )
    },
    [openFolderId],
  )

  const handleAddItem = useCallback(() => {
    const index = items.length
    const row = index % ITEM_COLUMN_SIZE
    const column = Math.floor(index / ITEM_COLUMN_SIZE)

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        label: `New folder ${index + 1}`,
        x: ITEM_START_X + column * 120,
        y: ITEM_START_Y + row * ITEM_GAP_Y,
        links: [],
      },
    ])
  }, [items])

  const handleFolderOpen = useCallback((folderId: string) => {
    setOpenFolderId(folderId)
    setSearchQuery('')
  }, [])

  const handleGoHome = useCallback(() => {
    setOpenFolderId(null)
    setResourcesPageOpen(false)
    setSearchQuery('')
  }, [])

  const handleToggleResources = useCallback(() => {
    setResourcesPageOpen((open) => !open)
  }, [])

  const handleFoldersItemsChange = useCallback((next: DesktopItem[]) => {
    setItems(next)
    setOpenFolderId((prev) => {
      if (prev && !next.some((f) => f.id === prev)) {
        return null
      }
      return prev
    })
  }, [])

  const handleSearchResultSelect = useCallback((result: DesktopSearchResult) => {
    setResourcesPageOpen(false)
    setOpenFolderId(result.folderId)
  }, [])

  const showFolderColorPicker = openFolderId === null && !resourcesPageOpen
  const searchPlaceholder = openFolderId === null
    ? 'Search folders or links'
    : 'Search links in this folder'
  const searchDropdownOpen = openFolderId === null && hasSearchQuery

  return {
    items,
    openFolderId,
    folderSidebarOpen,
    resourcesPageOpen,
    folderIconColor,
    searchQuery,
    openFolder,
    hasSearchQuery,
    visibleFolders,
    visibleLinks,
    globalLinkResults,
    showFolderColorPicker,
    searchPlaceholder,
    searchDropdownOpen,
    setSearchQuery,
    handleToggleFolderList,
    handleCloseFolderList,
    handleCloseResources,
    handleFolderSelect,
    handleFolderLinksChange,
    handleAddItem,
    handleFolderOpen,
    handleGoHome,
    handleToggleResources,
    handleFoldersItemsChange,
    handleSearchResultSelect,
    handleFolderIconColorChange: setFolderIconColor,
  }
}
