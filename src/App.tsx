import { useState } from 'react'
import { DesktopBanner } from './components/desktop-banner/DesktopBanner'
import { Desktop, type DesktopItem } from './components/desktop/Desktop'
import './App.scss'

const desktopItems: DesktopItem[] = [
  { id: '1', label: 'Bookmarks', x: 40, y: 40 },
  { id: '2', label: 'Reading list', x: 40, y: 160 },
]

const ITEM_GAP_Y = 120
const ITEM_START_X = 40
const ITEM_START_Y = 40
const ITEM_COLUMN_SIZE = 5

function App() {
  const [items, setItems] = useState<DesktopItem[]>(desktopItems)

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
      },
    ])
  }

  return (
    <div className="app-shell">
      <DesktopBanner onAddItem={handleAddItem} />
      <Desktop items={items} onItemsChange={setItems} />
    </div>
  )
}

export default App
