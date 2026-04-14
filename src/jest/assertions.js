import '@testing-library/jest-dom/extend-expect'

expect.extend({
  toHaveOnlyIcon(received) {
    const iconTag = received.children[0].tagName
    const elementChildrenLength = received.children.length
    if (iconTag === 'svg' && elementChildrenLength === 1) {
      return { pass: true }
    }

    return {
      pass: false,
      message: () => 'Expected to have an icon inside the element',
    }
  },
})
