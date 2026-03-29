import logoUrl from '../../core/ui/images/logo.png'
import './desktop-banner.scss'

type DesktopBannerProps = {
  onGoHome: () => void
  showAdd: boolean
  onAddItem: () => void
  resourcesOpen: boolean
  onToggleResources: () => void
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
          <svg
            className={
              props.folderListOpen
                ? 'desktop-banner__folders-triangle desktop-banner__folders-triangle--open'
                : 'desktop-banner__folders-triangle'
            }
            viewBox="0 0 12 14"
            aria-hidden="true"
            focusable="false"
          >
            <polygon points="0,0 12,7 0,14" />
          </svg>
          
        </button>
        <button
          type="button"
          className="desktop-banner__home"
          onClick={props.onGoHome}
          aria-label="Go to desktop home"
          title="Desktop home"
        >
          <img className="desktop-banner__logo" src={logoUrl} alt="" />
        </button>
      </div>
      <div className="desktop-banner__right">
        <button
          type="button"
          className="desktop-banner__resources-button typography--subhead-semibold"
          onClick={props.onToggleResources}
          aria-pressed={props.resourcesOpen}
          title={props.resourcesOpen ? 'Close resources list' : 'Open resources list'}
        >
          Resources
        </button>
        {props.showAdd ? (
          <button
            type="button"
            className="desktop-banner__add-button typography--subhead-semibold"
            onClick={props.onAddItem}
          >
            Add Folder +
          </button>
        ) : null}
      </div>
    </header>
  )
}
