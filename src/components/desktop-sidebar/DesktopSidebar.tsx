import { useEffect, type CSSProperties } from 'react'
import type { DesktopFolderRecord } from '../../core/storage/webStorageUtils'
import { folderAccentColor } from '../../core/ui/folderAccentColor'
import './desktop_sidebar.scss'

type DesktopSidebarProps = {
  open: boolean
  folders: DesktopFolderRecord[]
  /** When set, that folder’s row stays filled with its accent (folder is open). */
  activeFolderId: string | null
  onClose: () => void
  onFolderSelect: (folderId: string) => void
}

export function DesktopSidebar(props: DesktopSidebarProps) {
  const { open, onClose, folders, activeFolderId, onFolderSelect } = props

  useEffect(
    function closeOnEscape() {
      if (!open) return
      function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', onKeyDown)
      return function cleanup() {
        window.removeEventListener('keydown', onKeyDown)
      }
    },
    [open, onClose],
  )

  return (
    <div
      className={open ? 'desktop-sidebar desktop-sidebar--open' : 'desktop-sidebar'}
      aria-hidden={!open}
      inert={open ? undefined : true}
    >
      <aside
        id="desktop-folder-sidebar"
        className="desktop-sidebar__panel"
        aria-label="Folders"
      >
        <nav className="desktop-sidebar__nav" aria-label="All folders">
          <ul className="desktop-sidebar__list">
            {folders.map(function row(folder) {
              const accent = folderAccentColor(folder.id)
              const isActive = activeFolderId === folder.id
              return (
                <li key={folder.id}>
                  <button
                    type="button"
                    className={
                      isActive
                        ? 'desktop-sidebar__row desktop-sidebar__row--active typography--body color--text-main'
                        : 'desktop-sidebar__row typography--body color--text-main'
                    }
                    style={
                      {
                        '--folder-accent': accent,
                      } as CSSProperties
                    }
                    aria-current={isActive ? 'true' : undefined}
                    onClick={function selectFolder() {
                      onFolderSelect(folder.id)
                    }}
                  >
                    {folder.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </div>
  )
}
