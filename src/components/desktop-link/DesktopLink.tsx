import './desktop_link.scss'

export type DesktopLinkProps = {
  label: string
  imageSrc: string
  imageAlt: string
  x: number
  y: number
  dragging: boolean
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>
}

export function DesktopLink(props: DesktopLinkProps) {
  const className = 'desktop-link' + (props.dragging ? ' desktop-link--dragging' : '')

  return (
    <button
      type="button"
      className={className}
      style={{ left: props.x, top: props.y }}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onPointerMove}
      onPointerUp={props.onPointerUp}
      onPointerCancel={props.onPointerCancel}
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
  )
}
