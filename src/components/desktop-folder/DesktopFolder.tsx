import './desktop_folder.scss'

export type DesktopFolderProps = {
  label: string
  x: number
  y: number
  dragging: boolean
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>
}

export function DesktopFolder(props: DesktopFolderProps) {
  const className =
    'desktop-folder' + (props.dragging ? ' desktop-folder--dragging' : '')

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
      <img
        className="desktop-folder__icon"
        src="/folder.jpg"
        alt=""
        draggable={false}
      />
      <span className="desktop-folder__label typography--subhead-semibold is-centered-text">
        {props.label}
      </span>
    </button>
  )
}
