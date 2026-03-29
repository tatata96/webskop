import { useDesktopItemRename } from '../../hooks/useDesktopItemRename'
import './desktop_link.scss'

export type DesktopLinkProps = {
  label: string
  imageSrc: string
  imageAlt: string
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

export function DesktopLink(props: DesktopLinkProps) {
  const className = 'desktop-link' + (props.dragging ? ' desktop-link--dragging' : '')

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

  const labelOrInput = isRenaming ? (
    <input
      ref={inputRef}
      type="text"
      className="desktop-link__rename-input typography--subhead-semibold is-centered-text color--text-main"
      value={draft}
      aria-label="Link name"
      onChange={onRenameInputChange}
      onKeyDown={onRenameInputKeyDown}
      onBlur={commitRename}
      onClick={onRenameInputClick}
      onPointerDown={onRenameInputPointerDown}
    />
  ) : (
    <span className="desktop-link__label typography--subhead-semibold is-centered-text color--text-main">
      {props.label}
    </span>
  )

  const mainTile = isRenaming ? (
    <div className={className + ' desktop-link--rename-mode'}>
      <span className="desktop-link__frame">
        <img
          className="desktop-link__thumb"
          src={props.imageSrc}
          alt={props.imageAlt}
          draggable={false}
        />
      </span>
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
      <span className="desktop-link__frame">
        <img
          className="desktop-link__thumb"
          src={props.imageSrc}
          alt={props.imageAlt}
          draggable={false}
        />
      </span>
      {labelOrInput}
    </button>
  )

  return (
    <div
      className="desktop-link-tile"
      style={{ left: props.x, top: props.y }}
    >
      {mainTile}
      <div className="desktop-link-tile__actions">
        <button
          type="button"
          className="desktop-link-tile__rename typography--body"
          aria-label={`Rename link ${props.label}`}
          title="Rename"
          onClick={startRename}
          onPointerDown={handleRemovePointerDown}
        >
          ✎
        </button>
        <button
          type="button"
          className="desktop-link-tile__remove typography--body"
          aria-label={`Remove link ${props.label}`}
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
