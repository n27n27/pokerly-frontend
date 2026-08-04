const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)

  const selection = document.getSelection()
  const previousRange = selection?.rangeCount ? selection.getRangeAt(0) : null
  textarea.focus({ preventScroll: true })
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const copied = document.execCommand('copy')
  textarea.remove()

  if (previousRange && selection) {
    selection.removeAllRanges()
    selection.addRange(previousRange)
  }
  if (!copied) throw new Error('Clipboard copy failed')
}

export const copyToClipboard = async (text) => {
  const value = String(text ?? '')
  if (!value) throw new Error('Clipboard text is empty')

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // iOS Safari may expose the Clipboard API but reject the write.
    }
  }

  fallbackCopy(value)
}
