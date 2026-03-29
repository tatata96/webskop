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
import './App.scss'

const defaultDesktopItems: DesktopItem[] = [
  { id: '1', label: 'Bookmarks', x: 40, y: 40, links: [] },
  { id: '2', label: 'Reading list', x: 40, y: 160, links: [] },
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

  useEffect(() => {
    saveFolder(items)
  }, [items])

  useEffect(() => {
    saveFolderIconColor(folderIconColor)
  }, [folderIconColor])

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
  }

  function handleGoHome() {
    setOpenFolderId(null)
    setResourcesPageOpen(false)
  }

  function handleToggleResources() {
    setResourcesPageOpen(function toggle(open) {
      return !open
    })
  }

  function handleFoldersItemsChange(next: DesktopItem[]) {
    setItems(next)
    setOpenFolderId(function clearIfRemoved(prev) {
      if (prev && !next.some(function hasId(f) {
        return f.id === prev
      })) {
        return null
      }
      return prev
    })
  }

  const openFolder = openFolderId
    ? items.find(function find(f) {
        return f.id === openFolderId
      })
    : null

  const handleFolderLinksChange = useCallback(
    function handleFolderLinksChange(update: SetStateAction<DesktopLinkRecord[]>) {
      if (!openFolderId) return
      setItems(function merge(prev) {
        return prev.map(function mapFolder(f) {
          if (f.id !== openFolderId) return f
          const nextLinks =
            typeof update === 'function' ? update(f.links) : update
          return { ...f, links: nextLinks }
        })
      })
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
        onToggleFolderList={function toggleFolderList() {
          setFolderSidebarOpen(function toggle(open) {
            return !open
          })
        }}
      />
      <div className="app-shell__body">
        <div className="app-shell__main">
          {resourcesPageOpen ? (
            <ResourcesExport
              folders={items}
              onClose={function closeResources() {
                setResourcesPageOpen(false)
              }}
            />
          ) : openFolder ? (
            <Desktop
              surface="links"
              items={openFolder.links}
              onItemsChange={handleFolderLinksChange}
              folderAccentColor={folderAccentColor(openFolder.id)}
            />
          ) : (
            <Desktop
              surface="folders"
              items={items}
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
          onClose={function closeFolderSidebar() {
            setFolderSidebarOpen(false)
          }}
          onFolderSelect={function selectFolderFromSidebar(folderId: string) {
            setResourcesPageOpen(false)
            setOpenFolderId(folderId)
          }}
        />
      </div>
      <FolderColorPicker
        value={folderIconColor}
        onChange={setFolderIconColor}
      />
    </div>
  )
}

export default App
