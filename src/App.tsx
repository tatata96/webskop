import { useCallback, useEffect, useState, type SetStateAction } from 'react'
import { DesktopBanner } from './components/desktop-banner/DesktopBanner'
import { DesktopSidebar } from './components/desktop-sidebar/DesktopSidebar'
import { Desktop } from './components/desktop/Desktop'
import { FolderColorPicker } from './components/folder-color-picker/FolderColorPicker'
import { ResourcesExport } from './components/resources-export/ResourcesExport'
import type { DesktopItem, DesktopLinkRecord } from './core/storage/webStorageUtils'
import {
  loadFolderIconColor,
  loadFolders,
  saveFolder,
  saveFolderIconColor,
} from './core/storage/webStorageUtils'
import { folderAccentColor } from './core/ui/folderAccentColor'
import { useDesktopSearch, type DesktopSearchResult } from './hooks/useDesktopSearch'
import './App.scss'

const defaultDesktopItems: DesktopItem[] = [
  { id: '1', label: 'Test', x: 40, y: 40, links: [{ id: '1', url: 'https://www.google.com', label: 'Google', x: 40, y: 40 }] },
]

const ITEM_GAP_Y = 120
const ITEM_START_X = 40
const ITEM_START_Y = 40
const ITEM_COLUMN_SIZE = 5

function App() {
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

  const handleFolderLinksChange = useCallback(
    (update: SetStateAction<DesktopLinkRecord[]>) => {
      if (!openFolderId){
        return
      }
      setItems((prev) =>
        prev.map((folder) => {
          if (folder.id !== openFolderId){
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

  return (
    <div className="app-shell">
      <DesktopBanner
        onGoHome={handleGoHome}
        showAdd={openFolderId === null}
        onAddItem={handleAddItem}
        resourcesOpen={resourcesPageOpen}
        onToggleResources={handleToggleResources}
        folderListOpen={folderSidebarOpen}
        onToggleFolderList={() => {
          setFolderSidebarOpen((open) => !open)
        }}
        searchQuery={searchQuery}
        searchPlaceholder={
          openFolderId === null ? 'Search folders or links' : 'Search links in this folder'
        }
        onSearchQueryChange={setSearchQuery}
        searchDropdownOpen={openFolderId === null && hasSearchQuery}
        searchResults={globalLinkResults}
        onSelectSearchResult={handleSearchResultSelect}
        currentFolderLabel={openFolder?.label ?? null}
        folderTriangleColor={folderIconColor}
      />

      <div className="app-shell__body">
        <div className="app-shell__main">
          {resourcesPageOpen ? (
            <ResourcesExport
              folders={items}
              onClose={() => {
                setResourcesPageOpen(false)
              }}
            />
          ) : openFolder ? (
            <Desktop
              surface="links"
              items={visibleLinks}
              onItemsChange={handleFolderLinksChange}
              folderAccentColor={folderAccentColor(openFolder.id)}
            />
          ) : (
            <Desktop
              surface="folders"
              items={visibleFolders}
              onItemsChange={handleFoldersItemsChange}
              onFolderOpen={handleFolderOpen}
              folderIconColor={folderIconColor}
            />
          )}
        </div>

        <DesktopSidebar
          open={folderSidebarOpen}
          folders={items}
          activeFolderId={openFolderId}
          onClose={() => {
            setFolderSidebarOpen(false)
          }}
          onFolderSelect={(folderId: string) => {
            setResourcesPageOpen(false)
            setOpenFolderId(folderId)
            setSearchQuery('')
          }}
        />
      </div>
      
      {!openFolderId && !resourcesPageOpen && (
        <FolderColorPicker
        value={folderIconColor}
        onChange={setFolderIconColor}
      />
      )}
    </div>
  )

  function handleAddItem() {
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
  }

  function handleFolderOpen(folderId: string) {
    setOpenFolderId(folderId)
    setSearchQuery('')
  }

  function handleGoHome() {
    setOpenFolderId(null)
    setResourcesPageOpen(false)
    setSearchQuery('')
  }

  function handleToggleResources() {
    setResourcesPageOpen((open) => !open)
  }

  function handleFoldersItemsChange(next: DesktopItem[]) {
    setItems(next)
    setOpenFolderId((prev) => {
      if (prev && !next.some((f) => f.id === prev)) {
        return null
      }
      return prev
    })
  }

  function handleSearchResultSelect(result: DesktopSearchResult) {
    setResourcesPageOpen(false)
    setOpenFolderId(result.folderId)
  }
}

export default App
