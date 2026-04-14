let loadedScripts = {}

class ScriptLoader {
  static loadScript(entryName, scriptUrl) {
    return new Promise((resolve, reject) => {
      if (loadedScripts[entryName]) {
        resolve()
      } else {
        let script = document.createElement('script')
        script.id = entryName
        script.src = scriptUrl
        script.async = 1
        script.onload = () => {
          loadedScripts[entryName] = true
          resolve()
        }
        script.onerror = () => {
          reject()
        }
        document.body.appendChild(script)
      }
    })
  }
}

export default ScriptLoader
