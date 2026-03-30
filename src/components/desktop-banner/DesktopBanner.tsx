import { useState } from 'react'
import logoUrl from '../../core/ui/images/logo.png'
import './desktop-banner.scss'

export type DesktopSearchResult =
  {
      id: string
      kind: 'link'
      folderId: string
      folderLabel: string
      linkId: string
      linkLabel: string
      linkUrl: string
    }

type DesktopBannerProps = {
  onGoHome: () => void
  showAdd: boolean
  onAddItem: () => void
  resourcesOpen: boolean
  onToggleResources: () => void
  onToggleFolderList: () => void
  folderListOpen: boolean
  searchQuery: string
  searchPlaceholder: string
  onSearchQueryChange: (value: string) => void
  searchDropdownOpen: boolean
  searchResults: DesktopSearchResult[]
  onSelectSearchResult: (result: DesktopSearchResult) => void
}

export function DesktopBanner(props: DesktopBannerProps) {
  const [activeResultIndex, setActiveResultIndex] = useState(0)
  const hasSearchResults = props.searchResults.length > 0

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!props.searchDropdownOpen) {
      return
    }

    if (event.key === 'Escape') {
      return
    }

    if (!hasSearchResults) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveResultIndex((index) =>
        Math.min(index + 1, props.searchResults.length - 1),
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveResultIndex((index) => Math.max(index - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      props.onSelectSearchResult(props.searchResults[activeResultIndex])
    }
  }

  return (
    <header className="desktop-banner">
      <div className="desktop-banner__left">
        <button
          type="button"
          className="desktop-banner__home"
          onClick={props.onGoHome}
          aria-label="Go to desktop home"
          title="Desktop home"
        >
          <img className="desktop-banner__logo" src={logoUrl} alt="" />
        </button>
        <div className="desktop-banner__search">
          <input
            type="search"
            className="desktop-banner__search-input typography--subhead-semibold"
            value={props.searchQuery}
            onChange={(event) => {
              setActiveResultIndex(0)
              props.onSearchQueryChange(event.target.value)
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={props.searchPlaceholder}
            aria-label="Search folders and links"
          />
          {props.searchDropdownOpen ? (
            <div className="desktop-banner__search-dropdown" role="listbox" aria-label="Search results">
              {hasSearchResults ? (
                props.searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className={
                      result === props.searchResults[activeResultIndex]
                        ? 'desktop-banner__search-result desktop-banner__search-result--active'
                        : 'desktop-banner__search-result'
                    }
                    onMouseDown={(event) => {
                      event.preventDefault()
                    }}
                    onMouseEnter={() => {
                      setActiveResultIndex(
                        props.searchResults.findIndex((candidate) => candidate.id === result.id),
                      )
                    }}
                    onClick={() => {
                      props.onSelectSearchResult(result)
                    }}
                  >
                    <span className="desktop-banner__search-result-label typography--subhead-semibold">
                      {`${result.folderLabel} > ${result.linkLabel}`}
                    </span>
                  </button>
                ))
              ) : (
                <div className="desktop-banner__search-empty typography--body">
                  No matches found
                </div>
              )}
            </div>
          ) : null}
        </div>
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
      </div>
    </header>
  )
}
