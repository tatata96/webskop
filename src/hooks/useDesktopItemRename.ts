import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'

type UseDesktopItemRenameParams = {
  label: string
  onLabelChange: (nextLabel: string) => void
}

export function useDesktopItemRename(params: UseDesktopItemRenameParams) {
  const { label, onLabelChange } = params

  const [isRenaming, setIsRenaming] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(
    function focusRenameInput() {
      if (isRenaming && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    },
    [isRenaming],
  )

  useEffect(
    function listenEscapeWhileRenaming() {
      if (!isRenaming) return
      function onKeyDown(e: globalThis.KeyboardEvent) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setDraft(label)
          setIsRenaming(false)
        }
      }
      window.addEventListener('keydown', onKeyDown)
      return function cleanup() {
        window.removeEventListener('keydown', onKeyDown)
      }
    },
    [isRenaming, label],
  )

  function commitRename() {
    const next = draft.trim()
    if (next.length > 0) {
      onLabelChange(next)
    } else {
      setDraft(label)
    }
    setIsRenaming(false)
  }

  function startRename() {
    setDraft(label)
    setIsRenaming(true)
  }

  function onRenameInputChange(e: ChangeEvent<HTMLInputElement>) {
    setDraft(e.target.value)
  }

  function onRenameInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitRename()
    }
  }

  function stopRenameEventBubble(e: { stopPropagation(): void }) {
    e.stopPropagation()
  }

  return {
    isRenaming,
    draft,
    inputRef,
    commitRename,
    startRename,
    onRenameInputChange,
    onRenameInputKeyDown,
    onRenameInputClick: stopRenameEventBubble,
    onRenameInputPointerDown: stopRenameEventBubble,
  }
}
