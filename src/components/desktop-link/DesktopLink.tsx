import './desktop_link.scss'

export type DesktopLinkProps = {
  label: string
  imageSrc: string
  imageAlt: string
  x: number
  y: number
  dragging: boolean
  onRemove: () => void
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>
}

export function DesktopLink(props: DesktopLinkProps) {
  const className = 'desktop-link' + (props.dragging ? ' desktop-link--dragging' : '')

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
      className="desktop-link-tile"
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
        <span className="desktop-link__frame">
          <img
            className="desktop-link__thumb"
            src={props.imageSrc}
            alt={props.imageAlt}
            draggable={false}
          />
        </span>
        <span className="desktop-link__label typography--subhead-semibold is-centered-text color--text-main">
          {props.label}
        </span>
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
  )
}
