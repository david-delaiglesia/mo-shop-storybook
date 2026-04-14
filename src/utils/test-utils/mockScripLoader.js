class MockScriptLoader {
  static loadScript() {
    return new Promise((resolve) => resolve())
  }

  static loadScriptFail() {
    return new Promise((reject) => reject())
  }
}

export default MockScriptLoader
