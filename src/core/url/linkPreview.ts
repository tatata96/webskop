import type { DesktopLinkRecord } from './storage/webStorageUtils'

export type LinkPreviewResult = {
  title?: string
  previewImageUrl?: string
}

/**
 * Optional enrichment from a Chrome extension or future host bridge.
 * Return null when unavailable; the UI falls back to hostname label + favicon.
 */
export function requestLinkPreview(url: string): Promise<LinkPreviewResult | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }
  const bridge = (
    window as unknown as {
      webskopRequestLinkPreview?: (u: string) => Promise<LinkPreviewResult | null>
    }
  ).webskopRequestLinkPreview
  if (typeof bridge === 'function') {
    return bridge(url).catch(function onBridgeError() {
      return null
    })
  }
  return Promise.resolve(null)
}

export function faviconUrlForPageUrl(url: string): string {
  try {
    const u = new URL(url)
    const domain = encodeURIComponent(u.hostname)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return ''
  }
}

export function applyPreviewToLink(
  link: DesktopLinkRecord,
  preview: LinkPreviewResult | null,
): DesktopLinkRecord {
  if (!preview) return link
  return {
    ...link,
    label: preview.title && preview.title.trim() ? preview.title.trim() : link.label,
    previewImageUrl: preview.previewImageUrl ?? link.previewImageUrl,
  }
}
