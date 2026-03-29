import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { DesktopFolder } from '../desktop-folder/DesktopFolder'
import { DesktopLink } from '../desktop-link/DesktopLink'
import {
  applyPreviewToLink,
  faviconUrlForPageUrl,
  requestLinkPreview,
} from '../../core/url/linkPreview'
import type { DesktopItem, DesktopLinkRecord } from '../../core/storage/webStorageUtils'
import { hostnameLabel, parseHttpUrl } from '../../core/url/urlUtils'
import './desktop.scss'

export type { DesktopItem } from '../../core/storage/webStorageUtils'

const FOLDER_WIDTH = 96
const FOLDER_HEIGHT = 108
const LINK_WIDTH = 120
const LINK_HEIGHT = 152
const CLICK_DRAG_THRESHOLD_PX = 5

const FALLBACK_THUMB =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/** Grid for newly pasted links (matches folder placement on desktop root). */
const PASTE_ITEM_GAP_Y = 120
const PASTE_ITEM_START_X = 40
const PASTE_ITEM_START_Y = 40
const PASTE_ITEM_COLUMN_SIZE = 5
const PASTE_ITEM_COLUMN_STEP_X = 120

type DesktopFoldersProps = {
  surface: 'folders'
  items: DesktopItem[]
  onItemsChange: (items: DesktopItem[]) => void
  onFolderOpen: (folderId: string) => void
}

type DesktopLinksProps = {
  surface: 'links'
  items: DesktopLinkRecord[]
  onItemsChange: Dispatch<SetStateAction<DesktopLinkRecord[]>>
  folderAccentColor: string
}

export type DesktopProps = DesktopFoldersProps | DesktopLinksProps

type DragState = {
  id: string
  offsetX: number
  offsetY: number
  startClientX: number
  startClientY: number
  hasDragged: boolean
}

export function Desktop(props: DesktopProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const itemWidth = props.surface === 'folders' ? FOLDER_WIDTH : LINK_WIDTH
  const itemHeight = props.surface === 'folders' ? FOLDER_HEIGHT : LINK_HEIGHT

  const linksOnItemsChange =
    props.surface === 'links' ? props.onItemsChange : undefined

  const linksPatchRef = useRef<Dispatch<SetStateAction<DesktopLinkRecord[]>> | undefined>(
    undefined,
  )

  useEffect(
    function syncLinksPatchRef() {
      linksPatchRef.current = linksOnItemsChange
    },
    [linksOnItemsChange],
  )

  useEffect(
    function subscribePasteWhenLinksSurface() {
      function onPaste(e: ClipboardEvent) {
        const patchLinks = linksPatchRef.current
        if (!patchLinks) return

        const target = e.target
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable)
        ) {
          return
        }
        const text = e.clipboardData?.getData('text/plain') ?? ''
        const url = parseHttpUrl(text)
        if (!url) return
        e.preventDefault()

        const newId = crypto.randomUUID()
        patchLinks(function appendLink(prev) {
          const index = prev.length
          const row = index % PASTE_ITEM_COLUMN_SIZE
          const column = Math.floor(index / PASTE_ITEM_COLUMN_SIZE)
          const newLink = {
            id: newId,
            url,
            label: hostnameLabel(url),
            x: PASTE_ITEM_START_X + column * PASTE_ITEM_COLUMN_STEP_X,
            y: PASTE_ITEM_START_Y + row * PASTE_ITEM_GAP_Y,
          }
          return [...prev, newLink]
        })

        requestLinkPreview(url).then(function enrich(preview) {
          const patch = linksPatchRef.current
          if (!patch) return
          patch(function applyPreview(prev) {
            return prev.map(function mapLink(L) {
              return L.id === newId ? applyPreviewToLink(L, preview) : L
            })
          })
        })
      }

      window.addEventListener('paste', onPaste)
      return function cleanupPaste() {
        window.removeEventListener('paste', onPaste)
      }
    },
    [],
  )

  function handlePointerDown(
    item: { id: string; x: number; y: number },
    e: React.PointerEvent<HTMLButtonElement>,
  ) {
    if (e.button !== 0) return
    e.preventDefault()
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - item.x
    const offsetY = e.clientY - rect.top - item.y
    dragRef.current = {
      id: item.id,
      offsetX,
      offsetY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      hasDragged: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    const root = rootRef.current
    if (!drag || !root) return
    const dx = e.clientX - drag.startClientX
    const dy = e.clientY - drag.startClientY
    if (!drag.hasDragged && Math.hypot(dx, dy) >= CLICK_DRAG_THRESHOLD_PX) {
      drag.hasDragged = true
      setDraggingId(drag.id)
    }
    if (!drag.hasDragged) return
    const rect = root.getBoundingClientRect()
    let x = e.clientX - rect.left - drag.offsetX
    let y = e.clientY - rect.top - drag.offsetY
    x = Math.max(0, Math.min(x, rect.width - itemWidth))
    y = Math.max(0, Math.min(y, rect.height - itemHeight))

    if (props.surface === 'folders') {
      props.onItemsChange(
        props.items.map(function mapFolder(f) {
          if (f.id !== drag.id) return f
          return { ...f, x, y }
        }),
      )
    } else {
      props.onItemsChange(
        props.items.map(function mapLink(L) {
          if (L.id !== drag.id) return L
          return { ...L, x, y }
        }),
      )
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (drag && !drag.hasDragged) {
      if (props.surface === 'folders') {
        props.onFolderOpen(drag.id)
      } else {
        const link = props.items.find(function findLink(L) {
          return L.id === drag.id
        })
        if (link) {
          window.open(link.url, '_blank', 'noopener,noreferrer')
        }
      }
    }
    dragRef.current = null
    setDraggingId(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current = null
    setDraggingId(null)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  function removeItemById(id: string) {
    if (props.surface === 'folders') {
      props.onItemsChange(
        props.items.filter(function filterFolder(f) {
          return f.id !== id
        }),
      )
    } else {
      props.onItemsChange(function filterLinks(prev) {
        return prev.filter(function filterLink(L) {
          return L.id !== id
        })
      })
    }
  }

  if (props.surface === 'folders') {
    return (
      <div className="desktop" ref={rootRef}>
        {props.items.map(function renderFolder(folder) {
          return (
            <DesktopFolder
              key={folder.id}
              label={folder.label}
              x={folder.x}
              y={folder.y}
              dragging={draggingId === folder.id}
              onRemove={function removeFolder() {
                removeItemById(folder.id)
              }}
              onPointerDown={function onFolderDown(ev) {
                handlePointerDown(folder, ev)
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            />
          )
        })}
      </div>
    )
  }

  const linkSurfaceStyle: CSSProperties = {
    backgroundColor: props.folderAccentColor,
  }

  return (
    <div className="desktop" ref={rootRef} style={linkSurfaceStyle}>
      {props.items.map(function renderLink(link) {
        const imageSrc = link.previewImageUrl || faviconUrlForPageUrl(link.url) || FALLBACK_THUMB
        return (
          <DesktopLink
            key={link.id}
            label={link.label}
            imageSrc={imageSrc}
            imageAlt=""
            x={link.x}
            y={link.y}
            dragging={draggingId === link.id}
            onRemove={function removeLink() {
              removeItemById(link.id)
            }}
            onPointerDown={function onLinkDown(ev) {
              handlePointerDown(link, ev)
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        )
      })}
    </div>
  )
}
