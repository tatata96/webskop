import type { Dispatch, SetStateAction } from 'react'
import { DesktopFolder } from '../desktop-folder/DesktopFolder'
import { DesktopLink } from '../desktop-link/DesktopLink'
import type { DesktopFolderRecord, DesktopLinkRecord } from '../../core/storage/webStorageUtils'
import { faviconUrlForPageUrl } from '../../core/url/linkPreview'
import { useDesktopItemDrag } from '../../hooks/useDesktopItemDrag'
import { useDesktopLinksPaste } from '../../hooks/useDesktopLinksPaste'
import './desktop.scss'

const FOLDER_WIDTH = 96
const FOLDER_HEIGHT = 108
const LINK_TILE_WIDTH = 120
const LINK_TILE_HEIGHT = 130

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
  onItemsChange: Dispatch<SetStateAction<DesktopLinkRecord[]>>
  folderAccentColor?: string
  onFolderOpen?: (folderId: string) => void
  folderIconColor?: string
}

export type DesktopProps = DesktopFoldersProps | DesktopLinksProps

export function Desktop({
  surface,
  items,
  onItemsChange,
  onFolderOpen,
  folderIconColor,
  ...rest
}: DesktopProps) {
  if (surface === 'links') {
    return (
      <DesktopLinksView
        surface="links"
        items={items as DesktopLinkRecord[]}
        onItemsChange={onItemsChange}
        folderAccentColor={(rest as DesktopLinksProps).folderAccentColor}
      />
    )
  }

  return (
    <DesktopFoldersView
      surface="folders"
      items={items as DesktopFolderRecord[]}
      onItemsChange={onItemsChange as (items: DesktopFolderRecord[]) => void}
      onFolderOpen={onFolderOpen as (folderId: string) => void}
      folderIconColor={folderIconColor as string}
    />
  )
}

function DesktopFoldersView({
  items,
  onItemsChange,
  onFolderOpen,
  folderIconColor,
}: DesktopFoldersProps) {
  const {
    rootRef,
    draggingId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useDesktopItemDrag<DesktopFolderRecord>({
    items,
    onItemsChange,
    tileWidth: FOLDER_WIDTH,
    tileHeight: FOLDER_HEIGHT,
    onItemClick: onFolderOpen,
  })

  function handleFolderRemove(folderId: string) {
    const next = items.filter((folder) => folder.id !== folderId)
    onItemsChange(next)
  }

  function handleFolderLabelChange(folderId: string, nextLabel: string) {
    const next = items.map((f) => {
      if (f.id !== folderId) {
        return f
      }
      return { ...f, label: nextLabel }
    })
    onItemsChange(next)
  }

  return (
    <div className="desktop" ref={rootRef}>
      {items.map((folder) => (
        <DesktopFolder
          key={folder.id}
          label={folder.label}
          iconBodyColor={folderIconColor}
          x={folder.x}
          y={folder.y}
          dragging={draggingId === folder.id}
          onPointerDown={(ev) => {
            handlePointerDown(folder, ev)
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
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

function DesktopLinksView({
  items,
  onItemsChange,
  folderAccentColor,
}: DesktopLinksProps) {
  const {
    rootRef,
    draggingId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useDesktopItemDrag<DesktopLinkRecord>({
    items,
    onItemsChange: function handleLinksDragChange(next) {
      onItemsChange(next)
    },
    tileWidth: LINK_TILE_WIDTH,
    tileHeight: LINK_TILE_HEIGHT,
    onItemClick: (linkId) => {
      const link = items.find((L) => L.id === linkId)
      if (link) {
        window.open(link.url, '_blank', 'noopener,noreferrer')
      }
    },
  })

  useDesktopLinksPaste({
    enabled: true,
    onItemsChange,
  })

  const desktopStyle =
    folderAccentColor !== undefined
      ? {
          background: `linear-gradient(
        180deg,
        color-mix(in srgb, ${folderAccentColor} 14%, var(--blue-100)),
        var(--blue-100)
      )`,
        }
      : undefined

  function handleLinkRemove(linkId: string) {
    const next = items.filter((L) => L.id !== linkId)
    onItemsChange(next)
  }

  function handleLinkLabelChange(linkId: string, nextLabel: string) {
    const next = items.map((L) => {
      if (L.id !== linkId) {
        return L
      }
      return { ...L, label: nextLabel }
    })
    onItemsChange(next)
  }

  return (
    <div className="desktop" ref={rootRef} style={desktopStyle}>
      {items.length === 0 && (
        <p className="desktop__empty-links typography--body color--text-main">
          Paste your link directly here.
        </p>
      )}
      {items.map((link) => {
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
              handlePointerDown(link, event)
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
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
