export class IntersectionObserverMock {
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe = vi.fn((element: Element) => {
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 0.6,
          target: element,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    )
  })

  disconnect = vi.fn()
}
