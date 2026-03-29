import { useCallback, useEffect, useState, type SetStateAction } from 'react'
import { DesktopBanner } from './components/desktop-banner/DesktopBanner'
import { Desktop } from './components/desktop/Desktop'
import type { DesktopItem, DesktopLinkRecord } from './core/storage/webStorageUtils'
import { loadFolders, saveFolder } from './core/storage/webStorageUtils'
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

  useEffect(() => {
    saveFolder(items)
  }, [items])

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

  function handleBack() {
    setOpenFolderId(null)
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
        title={openFolder ? openFolder.label : 'Desktop'}
        showBack={Boolean(openFolder)}
        onBack={handleBack}
        showAdd={openFolderId === null}
        onAddItem={handleAddItem}
      />
      {openFolder ? (
        <Desktop
          surface="links"
          items={openFolder.links}
          onItemsChange={handleFolderLinksChange}
        />
      ) : (
        <Desktop
          surface="folders"
          items={items}
          onItemsChange={setItems}
          onFolderOpen={handleFolderOpen}
        />
      )}
    </div>
  )
}

export default App
