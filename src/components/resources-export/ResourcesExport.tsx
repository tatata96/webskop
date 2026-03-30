import { useEffect } from 'react'
import type { DesktopFolderRecord } from '../../core/storage/webStorageUtils'
import './resources_export.scss'

export type ResourcesExportProps = {
  folders: DesktopFolderRecord[]
  onClose: () => void
}

export function ResourcesExport(props: ResourcesExportProps) {
  const { folders, onClose } = props

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  function handleSavePdf() {
    document.body.classList.add('print-export')
    const cleanup = () => {
      document.body.classList.remove('print-export')
    }
    const onAfterPrint = () => {
      window.removeEventListener('afterprint', onAfterPrint)
      cleanup()
    }
    window.addEventListener('afterprint', onAfterPrint)
    window.print()
    window.setTimeout(() => {
      window.removeEventListener('afterprint', onAfterPrint)
      if (document.body.classList.contains('print-export')) {
        cleanup()
      }
    }, 2000)
  }

  return (
    <div className="resources-export">
      <div className="resources-export__list typography--body">
        {folders.map((folder) => (
          <section key={folder.id} className="resources-export__section">
            <h2 className="resources-export__folder-title typography--h5 color--text-main">
              {folder.label}
            </h2>
            {folder.links.length === 0 ? (
              <p className="resources-export__empty typography--body color--text-main">
                No links
              </p>
            ) : (
              <ul className="resources-export__link-list">
                {folder.links.map((link) => (
                  <li key={link.id} className="resources-export__link-item">
                    <a
                      href={link.url}
                      className="resources-export__link typography--body"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <aside className="resources-export__actions" aria-label="Export">
        <div className="resources-export__action-buttons">
          <button
            type="button"
            className="resources-export__btn resources-export__btn--primary typography--subhead-semibold"
            onClick={handleSavePdf}
            title="Save as PDF (opens the print dialog)"
          >
            Export as PDF
          </button>
        </div>
      </aside>
    </div>
  )
}
