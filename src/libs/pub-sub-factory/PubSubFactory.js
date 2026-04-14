const PubSubFactory = () => {
  const subscribers = new Set()

  const subscribe = (fn) => {
    subscribers.add(fn)

    return () => subscribers.delete(fn)
  }

  const publish = (data) => subscribers.forEach((fn) => fn(data))

  return Object.freeze({ publish, subscribe })
}

export { PubSubFactory }
