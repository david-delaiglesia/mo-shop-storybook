export default function () {
  let allCallbacks = {}
  let callbacksLength = 0

  let prevTime = 0

  const raf = (callback) => {
    callbacksLength += 1

    allCallbacks[callbacksLength] = callback
    return callbacksLength
  }

  const cancel = (id) => {
    delete allCallbacks[id]
  }

  const step = (opts) => {
    const options = {
      time: 1000 / 60,
      count: 1,
      ...opts,
    }

    let oldAllCallbacks

    for (let i = 0; i < options.count; i++) {
      oldAllCallbacks = allCallbacks
      allCallbacks = {}

      Object.keys(oldAllCallbacks).forEach((id) => {
        let callback = oldAllCallbacks[id]
        callback(prevTime + options.time)
      })

      prevTime += options.time
    }
  }

  return {
    raf: raf,
    cancel: cancel,
    step: step,
  }
}
