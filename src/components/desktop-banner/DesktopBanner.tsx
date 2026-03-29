import './desktop-banner.scss'

type DesktopBannerProps = {
  title: string
  showBack: boolean
  onBack: () => void
  showAdd: boolean
  onAddItem: () => void
}

export function DesktopBanner(props: DesktopBannerProps) {
  return (
    <header className="desktop-banner">
      <div className="desktop-banner__left">
        {props.showBack ? (
          <button
            type="button"
            className="desktop-banner__back typography--subhead-semibold"
            onClick={props.onBack}
          >
            Back
          </button>
        ) : null}
        <div className="desktop-banner__title typography--subhead-semibold">{props.title}</div>
      </div>
      <div className="desktop-banner__right">
        {props.showAdd ? (
          <button
            type="button"
            className="desktop-banner__add-button typography--subhead-semibold"
            onClick={props.onAddItem}
          >
            Add
          </button>
        ) : null}
      </div>
    </header>
  )
}
