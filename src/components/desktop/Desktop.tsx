import { useRef, useState } from 'react'
import { DesktopFolder } from '../desktop-folder/DesktopFolder'
import './desktop.scss'

type FolderItem = {
  id: string
  label: string
  x: number
  y: number
}

const FOLDER_WIDTH = 96
const FOLDER_HEIGHT = 108

const INITIAL_FOLDERS: FolderItem[] = [
  { id: '1', label: 'Bookmarks', x: 40, y: 40 },
  { id: '2', label: 'Reading list', x: 40, y: 160 },
]

export function Desktop() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
  } | null>(null)

  function handleFolderPointerDown(folder: FolderItem, e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return
    e.preventDefault()
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - folder.x
    const offsetY = e.clientY - rect.top - folder.y
    dragRef.current = { id: folder.id, offsetX, offsetY }
    setDraggingId(folder.id)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleFolderPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    const root = rootRef.current
    if (!drag || !root) return
    const rect = root.getBoundingClientRect()
    let x = e.clientX - rect.left - drag.offsetX
    let y = e.clientY - rect.top - drag.offsetY
    x = Math.max(0, Math.min(x, rect.width - FOLDER_WIDTH))
    y = Math.max(0, Math.min(y, rect.height - FOLDER_HEIGHT))
    setFolders(function updateFolders(prev) {
      return prev.map(function mapFolder(f) {
        if (f.id !== drag.id) return f
        return { ...f, x, y }
      })
    })
  }

  function handleFolderPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current = null
    setDraggingId(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <div className="desktop" ref={rootRef}>
      {folders.map(function renderFolder(folder) {
        return (
          <DesktopFolder
            key={folder.id}
            label={folder.label}
            x={folder.x}
            y={folder.y}
            dragging={draggingId === folder.id}
            onPointerDown={function onFolderDown(ev) {
              handleFolderPointerDown(folder, ev)
            }}
            onPointerMove={handleFolderPointerMove}
            onPointerUp={handleFolderPointerUp}
            onPointerCancel={handleFolderPointerUp}
          />
        )
      })}
    </div>
  )
}
