export function parseHttpUrl(text: string): string | null {
  const t = text.trim()
  if (!t) return null
  try {
    const u = new URL(t)
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return u.href
    }
    return null
  } catch {
    try {
      const u = new URL('https://' + t)
      if (u.hostname.length > 0) {
        return u.href
      }
    } catch {
      return null
    }
  }
  return null
}

export function hostnameLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
