import { render, screen } from '@testing-library/react'

import { CustomImg } from '../CustomImg'

describe('<CustomImg />', () => {
  const props = {
    placeHolder: 'testPlaceholder',
    error: 'testError',
    src: 'https://sta-mercadona.imgix.net/20190722/01/5901/vlc1/5901_00_01.jpg?fit=crop&amp;h=600&amp;w=600',
    thumbnail:
      'https://sta-mercadona.imgix.net/20190722/01/5901/vlc1/5901_00_01.jpg?fit=crop&amp;h=206&amp;w=206',
    alt: 'test alt',
  }

  Object.defineProperty(global.Image.prototype, 'src', {
    set(src) {
      if (src === props.error) {
        this.onerror(new Error('mocked error'))
      } else if (src === props.src || props.thumbnail) {
        this.onload()
      }
    },
  })

  it('should exist', () => {
    render(<CustomImg {...props} />)

    const image = screen.getByRole('img', {
      name: 'test alt',
    })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', props.src)
  })
})
