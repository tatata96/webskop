import folderIconUrl from '../../core/ui/icons/folder.svg'
import { useDesktopItemRename } from '../../hooks/useDesktopItemRename'
import './desktop_folder.scss'

export type DesktopFolderProps = {
  label: string
  x: number
  y: number
  dragging: boolean
  onRemove: () => void
  onLabelChange: (nextLabel: string) => void
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>
}

export function DesktopFolder(props: DesktopFolderProps) {
  const className =
    'desktop-folder' + (props.dragging ? ' desktop-folder--dragging' : '')

  const {
    isRenaming,
    draft,
    inputRef,
    commitRename,
    startRename,
    onRenameInputChange,
    onRenameInputKeyDown,
    onRenameInputClick,
    onRenameInputPointerDown,
  } = useDesktopItemRename({
    label: props.label,
    onLabelChange: props.onLabelChange,
  })

  function handleRemovePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    e.preventDefault()
  }

  function handleTileContextMenu(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    props.onRemove()
  }

  const icon = (
    <img
      className="desktop-folder__icon"
      src={folderIconUrl}
      alt=""
      draggable={false}
    />
  )

  const labelOrInput = isRenaming ? (
    <input
      ref={inputRef}
      type="text"
      className="desktop-folder__rename-input typography--subhead-semibold is-centered-text"
      value={draft}
      aria-label="Folder name"
      onChange={onRenameInputChange}
      onKeyDown={onRenameInputKeyDown}
      onBlur={commitRename}
      onClick={onRenameInputClick}
      onPointerDown={onRenameInputPointerDown}
    />
  ) : (
    <span className="desktop-folder__label typography--subhead-semibold is-centered-text">
      {props.label}
    </span>
  )

  const mainTile = isRenaming ? (
    <div className={className + ' desktop-folder--rename-mode'}>
      {icon}
      {labelOrInput}
    </div>
  ) : (
    <button
      type="button"
      className={className}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onPointerMove}
      onPointerUp={props.onPointerUp}
      onPointerCancel={props.onPointerCancel}
      onContextMenu={handleTileContextMenu}
    >
      {icon}
      {labelOrInput}
    </button>
  )

  return (
    <div
      className="desktop-folder-tile"
      style={{ left: props.x, top: props.y }}
    >
      {mainTile}
      <div className="desktop-folder-tile__actions">
        <button
          type="button"
          className="desktop-folder-tile__rename typography--body"
          aria-label={`Rename folder ${props.label}`}
          title="Rename"
          onClick={startRename}
          onPointerDown={handleRemovePointerDown}
        >
          ✎
        </button>
        <button
          type="button"
          className="desktop-folder-tile__remove typography--body"
          aria-label={`Remove folder ${props.label}`}
          onClick={function onRemoveClick() {
            props.onRemove()
          }}
          onPointerDown={handleRemovePointerDown}
        >
          ×
        </button>
      </div>
    </div>
  )
}
