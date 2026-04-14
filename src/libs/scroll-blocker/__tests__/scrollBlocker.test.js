import { createScrollBlocker } from '../../scroll-blocker'

describe('createScrollBlocker', () => {
  const blockClass = 'scroll--block'

  const scrollBlocker = createScrollBlocker(blockClass)

  it('should block the scroll', () => {
    scrollBlocker.block()

    expect(document.body.className).toBe(blockClass)
  })

  it('should unBlock the scroll if is not blocked previously', () => {
    scrollBlocker.unBlock()

    expect(document.body.className).toBe('')
  })

  it('should not unBlock the scroll if was previously blocked', () => {
    document.body.className = blockClass

    scrollBlocker.block()
    scrollBlocker.unBlock()

    expect(document.body.className).toBe(blockClass)
  })
})
