function fallbackCopyTextToClipboard(text) {
  let textArea = document.createElement('textArea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  let range = document.createRange()
  range.selectNode(textArea)
  window.getSelection().addRange(range)

  document.execCommand('copy')

  window.getSelection().removeAllRanges()
  textArea.remove()
}

export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text)
  }

  return navigator.clipboard.writeText(text)
}
