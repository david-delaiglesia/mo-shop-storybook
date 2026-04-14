export function showFile(fileBody, fileName) {
  const urlFile = URL.createObjectURL(fileBody)
  const a = document.createElement('a')
  a.href = urlFile
  a.download = fileName

  try {
    dispatchClickEvent(a)
  } catch {
    window.navigator.msSaveOrOpenBlob(fileBody, fileName)
  }
}

function dispatchClickEvent(element) {
  const event = new MouseEvent('click')
  element.dispatchEvent(event)
}
