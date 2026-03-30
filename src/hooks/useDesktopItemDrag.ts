import { useRef, useState, type PointerEvent } from 'react'

type DesktopDraggableItem = {
  id: string
  x: number
  y: number
}

type DragState = {
  id: string
  offsetX: number
  offsetY: number
  startClientX: number
  startClientY: number
}

const CLICK_MOVE_THRESHOLD_PX = 5

type UseDesktopItemDragParams<T extends DesktopDraggableItem> = {
  items: T[]
  onItemsChange: (items: T[]) => void
  tileWidth: number
  tileHeight: number
  onItemClick?: (id: string) => void
}

export function useDesktopItemDrag<T extends DesktopDraggableItem>(
  params: UseDesktopItemDragParams<T>,
) {
  const { items, onItemsChange, tileWidth, tileHeight, onItemClick } = params

  const rootRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragRef = useRef<DragState | null>(null)

  function handlePointerDown(item: T, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()

    const root = rootRef.current
    if (!root) {
      return
    }

    const rect = root.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - item.x
    const offsetY = event.clientY - rect.top - item.y

    dragRef.current = {
      id: item.id,
      offsetX,
      offsetY,
      startClientX: event.clientX,
      startClientY: event.clientY,
    }

    setDraggingId(item.id)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    const root = rootRef.current
    if (!drag || !root) {
      return
    }

    const rect = root.getBoundingClientRect()
    let x = event.clientX - rect.left - drag.offsetX
    let y = event.clientY - rect.top - drag.offsetY
    x = Math.max(0, Math.min(x, rect.width - tileWidth))
    y = Math.max(0, Math.min(y, rect.height - tileHeight))

    const next = items.map((item) => {
      if (item.id !== drag.id) {
        return item
      }
      return { ...item, x, y }
    })

    onItemsChange(next)
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    dragRef.current = null
    setDraggingId(null)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (!drag) {
      return
    }

    if (event.button !== 0) {
      return
    }

    const moved =
      Math.abs(event.clientX - drag.startClientX) > CLICK_MOVE_THRESHOLD_PX ||
      Math.abs(event.clientY - drag.startClientY) > CLICK_MOVE_THRESHOLD_PX

    if (!moved) {
      onItemClick?.(drag.id)
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    endDrag(event)
  }

  function handlePointerCancel(event: PointerEvent<HTMLButtonElement>) {
    endDrag(event)
  }

  return {
    rootRef,
    draggingId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  }
}

