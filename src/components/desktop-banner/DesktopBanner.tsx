import './desktop-banner.scss'

type DesktopBannerProps = {
  onGoHome: () => void
  showAdd: boolean
  onAddItem: () => void
  onToggleFolderList: () => void
  folderListOpen: boolean
}

export function DesktopBanner(props: DesktopBannerProps) {
  return (
    <header className="desktop-banner">
      <div className="desktop-banner__left">
        <button
          type="button"
          className="desktop-banner__menu-button typography--subhead-semibold"
          onClick={props.onToggleFolderList}
          aria-expanded={props.folderListOpen}
          aria-controls="desktop-folder-sidebar"
          title={props.folderListOpen ? 'Hide folder list' : 'Show folder list'}
        >
          <span
            className={
              props.folderListOpen
                ? 'desktop-banner__folder-arrow desktop-banner__folder-arrow--open'
                : 'desktop-banner__folder-arrow'
            }
            aria-hidden
          >
            <svg
              className="desktop-banner__folder-arrow-svg"
              viewBox="0 0 24 24"
              width={20}
              height={20}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <button
          type="button"
          className="desktop-banner__home"
          onClick={props.onGoHome}
          aria-label="Go to desktop home"
          title="Desktop home"
        >
          <span className="desktop-banner__wordmark typography--h5 color--text-main">
            webskop
          </span>
        </button>
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
