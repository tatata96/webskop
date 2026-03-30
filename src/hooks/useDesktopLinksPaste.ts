import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import type { DesktopLinkRecord } from '../core/storage/webStorageUtils'
import { applyPreviewToLink, requestLinkPreview } from '../core/url/linkPreview'
import { hostnameLabel, parseHttpUrl } from '../core/url/urlUtils'

export type DesktopPasteGridConfig = {
  startX: number
  startY: number
  gapY: number
  columnSize: number
  columnStepX: number
}

const PASTE_ITEM_GAP_Y = 120
const PASTE_ITEM_START_X = 40
const PASTE_ITEM_START_Y = 40
const PASTE_ITEM_COLUMN_SIZE = 5
const PASTE_ITEM_COLUMN_STEP_X = 120

type UseDesktopLinksPasteParams = {
  enabled: boolean
  onItemsChange: Dispatch<SetStateAction<DesktopLinkRecord[]>>
  grid?: DesktopPasteGridConfig
}

export function useDesktopLinksPaste({
  enabled,
  onItemsChange,
  grid,
}: UseDesktopLinksPasteParams) {
  const {
    startX,
    startY,
    gapY,
    columnSize,
    columnStepX,
  } = grid ?? {
    startX: PASTE_ITEM_START_X,
    startY: PASTE_ITEM_START_Y,
    gapY: PASTE_ITEM_GAP_Y,
    columnSize: PASTE_ITEM_COLUMN_SIZE,
    columnStepX: PASTE_ITEM_COLUMN_STEP_X,
  }

  const linksPatchRef = useRef<Dispatch<SetStateAction<DesktopLinkRecord[]>> | undefined>(
    undefined,
  )

  useEffect(
    function syncLinksPatchRef() {
      linksPatchRef.current = onItemsChange
    },
    [onItemsChange],
  )

  useEffect(
    function subscribePasteOnLinksSurface() {
      if (!enabled) {
        return
      }

      function onPaste(e: ClipboardEvent) {
        const patchLinks = linksPatchRef.current
        if (!patchLinks) {
          return
        }

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
        if (!url) {
          return
        }

        e.preventDefault()

        const newId = crypto.randomUUID()
        patchLinks(function appendLink(prev) {
          const index = prev.length
          const row = index % columnSize
          const column = Math.floor(index / columnSize)
          return [
            ...prev,
            {
              id: newId,
              url,
              label: hostnameLabel(url),
              x: startX + column * columnStepX,
              y: startY + row * gapY,
            },
          ]
        })

        requestLinkPreview(url).then(function enrich(preview) {
          const patch = linksPatchRef.current
          if (!patch) {
            return
          }
          patch((prev) => {
            return prev.map((link) => {
              if (link.id === newId) {
                return applyPreviewToLink(link, preview)
              }
              return link
            })
          })
        })
      }

      window.addEventListener('paste', onPaste)
      return function cleanupPaste() {
        window.removeEventListener('paste', onPaste)
      }
    },
    [enabled, startX, startY, gapY, columnSize, columnStepX],
  )
}

