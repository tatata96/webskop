import { useRef, useState, type PointerEvent } from 'react'
import { DesktopFolder } from '../desktop-folder/DesktopFolder'
import { DesktopLink } from '../desktop-link/DesktopLink'
import type { DesktopFolderRecord, DesktopLinkRecord } from '../../core/storage/webStorageUtils'
import { faviconUrlForPageUrl } from '../../core/url/linkPreview'
import './desktop.scss'

const FOLDER_WIDTH = 96
const FOLDER_HEIGHT = 108
const LINK_TILE_WIDTH = 120
const LINK_TILE_HEIGHT = 130
const CLICK_MOVE_THRESHOLD_PX = 5

type DesktopFoldersProps = {
  surface: 'folders'
  items: DesktopFolderRecord[]
  onItemsChange: (items: DesktopFolderRecord[]) => void
  onFolderOpen: (folderId: string) => void
  folderIconColor: string
}

type DesktopLinksProps = {
  surface: 'links'
  items: DesktopLinkRecord[]
  onItemsChange: (items: DesktopLinkRecord[]) => void
  folderAccentColor?: string
}

export type DesktopProps = DesktopFoldersProps | DesktopLinksProps

export function Desktop(props: DesktopProps) {
  if (props.surface === 'links') {
    return <DesktopLinksView {...props} />
  }
  return <DesktopFoldersView {...props} />
}

function DesktopFoldersView(props: DesktopFoldersProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
    startClientX: number
    startClientY: number
  } | null>(null)

  function handleFolderPointerDown(
    folder: DesktopFolderRecord,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0) return
    event.preventDefault()
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - folder.x
    const offsetY = event.clientY - rect.top - folder.y
    dragRef.current = {
      id: folder.id,
      offsetX,
      offsetY,
      startClientX: event.clientX,
      startClientY: event.clientY,
    }
    setDraggingId(folder.id)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleFolderPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    const root = rootRef.current
    if (!drag || !root) return
    const rect = root.getBoundingClientRect()
    let x = e.clientX - rect.left - drag.offsetX
    let y = e.clientY - rect.top - drag.offsetY
    x = Math.max(0, Math.min(x, rect.width - FOLDER_WIDTH))
    y = Math.max(0, Math.min(y, rect.height - FOLDER_HEIGHT))
    const next = props.items.map((f) => {
      if (f.id !== drag.id) return f
      return { ...f, x, y }
    })
    props.onItemsChange(next)
  }

  function handleFolderPointerUp(e: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    dragRef.current = null
    setDraggingId(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (drag && e.button === 0) {
      const moved =
        Math.abs(e.clientX - drag.startClientX) > CLICK_MOVE_THRESHOLD_PX ||
        Math.abs(e.clientY - drag.startClientY) > CLICK_MOVE_THRESHOLD_PX
      if (!moved) {
        props.onFolderOpen(drag.id)
      }
    }
  }

  function handleFolderRemove(folderId: string) {
    const next = props.items.filter((folder) => folder .id !== folderId)
    props.onItemsChange(next)
  }

  function handleFolderLabelChange(folderId: string, nextLabel: string) {
    const next = props.items.map((f) => {
      if (f.id !== folderId) return f
      return { ...f, label: nextLabel }
    })
    props.onItemsChange(next)
  }

  return (
    <div className="desktop" ref={rootRef}>
      {props.items.map((folder) => (
        <DesktopFolder
          key={folder.id}
          label={folder.label}
          iconBodyColor={props.folderIconColor}
          x={folder.x}
          y={folder.y}
          dragging={draggingId === folder.id}
          onPointerDown={(ev) => {
            handleFolderPointerDown(folder, ev)
          }}
          onPointerMove={handleFolderPointerMove}
          onPointerUp={handleFolderPointerUp}
          onPointerCancel={handleFolderPointerUp}
          onRemove={() => {
            handleFolderRemove(folder.id)
          }}
          onLabelChange={(nextLabel) => {
            handleFolderLabelChange(folder.id, nextLabel)
          }}
        />
      ))}
    </div>
  )
}

function DesktopLinksView(props: DesktopLinksProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
    startClientX: number
    startClientY: number
  } | null>(null)

  const desktopStyle =
    props.folderAccentColor !== undefined
      ? {
          background: `linear-gradient(
        180deg,
        color-mix(in srgb, ${props.folderAccentColor} 14%, var(--blue-100)),
        var(--blue-100)
      )`,
        }
      : undefined

  function handleLinkPointerDown(link: DesktopLinkRecord, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    event.preventDefault()
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - link.x
    const offsetY = event.clientY - rect.top - link.y
    dragRef.current = {
      id: link.id,
      offsetX,
      offsetY,
      startClientX: event.clientX,
      startClientY: event.clientY,
    }
    setDraggingId(link.id)
    event.currentTarget.setPointerCapture(event .pointerId)
  }

  function handleLinkPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    const root = rootRef.current
    if (!drag || !root) return
    const rect = root.getBoundingClientRect()
    let x = e.clientX - rect.left - drag.offsetX
    let y = e.clientY - rect.top - drag.offsetY
    x = Math.max(0, Math.min(x, rect.width - LINK_TILE_WIDTH))
    y = Math.max(0, Math.min(y, rect.height - LINK_TILE_HEIGHT))
    const next = props.items.map((L) => {
      if (L.id !== drag.id) return L
      return { ...L, x, y }
    })
    props.onItemsChange(next)
  }

  function handleLinkPointerUp(e: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    dragRef.current = null
    setDraggingId(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (drag && e.button === 0) {
      const moved =
        Math.abs(e.clientX - drag.startClientX) > CLICK_MOVE_THRESHOLD_PX ||
        Math.abs(e.clientY - drag.startClientY) > CLICK_MOVE_THRESHOLD_PX
      if (!moved) {
        const link = props.items.find((L) => L.id === drag.id)
        if (link) {
          window.open(link.url, '_blank', 'noopener,noreferrer')
        }
      }
    }
  }

  function handleLinkRemove(linkId: string) {
    const next = props.items.filter((L) => L.id !== linkId)
    props.onItemsChange(next)
  }

  function handleLinkLabelChange(linkId: string, nextLabel: string) {
    const next = props.items.map((L) => {
      if (L.id !== linkId) return L
      return { ...L, label: nextLabel }
    })
    props.onItemsChange(next)
  }

  return (
    <div className="desktop" ref={rootRef} style={desktopStyle}>
      {props.items.map((link) => {
        const imageSrc = link.previewImageUrl ?? faviconUrlForPageUrl(link.url)
        const imageAlt = link.label || link.url
        return (
          <DesktopLink
            key={link.id}
            label={link.label}
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            x={link.x}
            y={link.y}
            dragging={draggingId === link.id}
            onPointerDown={(event) => {
              handleLinkPointerDown(link, event)
            }}
            onPointerMove={handleLinkPointerMove}
            onPointerUp={handleLinkPointerUp}
            onPointerCancel={handleLinkPointerUp}
            onRemove={() => {
              handleLinkRemove(link.id)
            }}
            onLabelChange={(nextLabel) => {
              handleLinkLabelChange(link.id, nextLabel)
            }}
          />
        )
      })}
    </div>
  )
}
