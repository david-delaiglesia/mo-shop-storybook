import { render, screen } from '@testing-library/react'

import { MobileBlockerLayout } from '../MobileBlockerLayout'

import { MOBILE_OS } from 'libs/mobile-detector'

describe('<MobileBlockerLayout />', () => {
  it('should return GenericLayout if props layout is generic', () => {
    render(<MobileBlockerLayout layout={MOBILE_OS.GENERIC} />)

    const genericImage = screen.getAllByRole('img')[3]

    expect(genericImage).toHaveAttribute(
      'src',
      '/src/components/mobile-blocker-layout/assets/img_generic.jpg',
    )
    expect(
      screen.getByRole('img', {
        name: 'Abrir App en Play Store',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Abrir App en App Store',
      }),
    ).toBeInTheDocument()
  })

  it('should return AndroidLayout if props layout is android', () => {
    render(<MobileBlockerLayout layout={MOBILE_OS.ANDROID} />)

    const genericImage = screen.getAllByRole('img')[2]

    expect(genericImage).toHaveAttribute(
      'src',
      '/src/components/mobile-blocker-layout/assets/img_generic.jpg',
    )
    expect(
      screen.getByRole('img', {
        name: 'Abrir App en Play Store',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', {
        name: 'Abrir App en App Store',
      }),
    ).not.toBeInTheDocument()
  })

  it('should return iOSLayout if props layout is android', () => {
    render(<MobileBlockerLayout layout={MOBILE_OS.IOS} />)

    const iosImg = screen.getAllByRole('img')[2]

    expect(iosImg).toHaveAttribute(
      'src',
      '/src/components/mobile-blocker-layout/assets/img_iOS.jpg',
    )
    expect(
      screen.queryByRole('img', {
        name: 'Abrir App en Play Store',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Abrir App en App Store',
      }),
    ).toBeInTheDocument()
  })
})
