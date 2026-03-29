import { useState } from 'react'
import { Desktop, type DesktopItem } from './components/desktop/Desktop'

const desktopItems: DesktopItem[] = [
  { id: '1', label: 'Bookmarks', x: 40, y: 40 },
  { id: '2', label: 'Reading list', x: 40, y: 160 },
]

function App() {
  const [items, setItems] = useState<DesktopItem[]>(desktopItems)

  return <Desktop items={items} onItemsChange={setItems} />
}

export default App
