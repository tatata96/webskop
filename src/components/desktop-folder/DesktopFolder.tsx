import folderIconUrl from '../../core/ui/icons/folder.svg'
import './desktop_folder.scss'

export type DesktopFolderProps = {
  label: string
  x: number
  y: number
  dragging: boolean
  onRemove: () => void
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>
}

export function DesktopFolder(props: DesktopFolderProps) {
  const className =
    'desktop-folder' + (props.dragging ? ' desktop-folder--dragging' : '')

  function handleRemovePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    e.preventDefault()
  }

  function handleTileContextMenu(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    props.onRemove()
  }

  return (
    <div
      className="desktop-folder-tile"
      style={{ left: props.x, top: props.y }}
    >
      <button
        type="button"
        className={className}
        onPointerDown={props.onPointerDown}
        onPointerMove={props.onPointerMove}
        onPointerUp={props.onPointerUp}
        onPointerCancel={props.onPointerCancel}
        onContextMenu={handleTileContextMenu}
      >
        <img
          className="desktop-folder__icon"
          src={folderIconUrl}
          alt=""
          draggable={false}
        />
        <span className="desktop-folder__label typography--subhead-semibold is-centered-text">
          {props.label}
        </span>
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
  )
}
