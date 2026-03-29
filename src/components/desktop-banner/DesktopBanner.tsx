import './desktop-banner.scss'

type DesktopBannerProps = {
  onAddItem: () => void
}

export function DesktopBanner(props: DesktopBannerProps) {
  return (
    <header className="desktop-banner">
      <div className="desktop-banner__title typography--subhead-semibold">
        Desktop
      </div>
      <button
        type="button"
        className="desktop-banner__add-button typography--subhead-semibold"
        onClick={props.onAddItem}
      >
        Add
      </button>
    </header>
  )
}
