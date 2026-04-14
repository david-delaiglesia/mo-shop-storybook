import { PubSubFactory } from '../../pub-sub-factory'

describe('PubSubFactory', () => {
  const TestPubSub = PubSubFactory()

  it('should call the subscriber if we call to publish', () => {
    const callback = vi.fn()
    TestPubSub.subscribe(callback)

    TestPubSub.publish()

    expect(callback).toHaveBeenCalled()
  })
})
