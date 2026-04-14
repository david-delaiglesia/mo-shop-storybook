import { render } from '@testing-library/react'

import { MarketLinks } from 'components/market-links'

describe('<MarketLinks />', () => {
  const iOSImageAlte = 'Abrir App en App Store'
  const androidImageAlte = 'Abrir App en Play Store'

  const onClickOnDownloadApp = vi.fn()

  describe('when no prop is passed', () => {
    it('should show IOS store image and Android store image', () => {
      const marketLinks = render(
        <MarketLinks onClickOnDownloadApp={onClickOnDownloadApp} />,
      )

      expect(
        marketLinks.getByRole('img', {
          name: iOSImageAlte,
        }),
      ).toBeInTheDocument()
      expect(
        marketLinks.getByRole('img', {
          name: androidImageAlte,
        }),
      ).toBeInTheDocument()
    })
  })

  describe('when hideAndroid prop is passed as true', () => {
    it('should show IOS store image and hide Android store image', () => {
      const marketLinks = render(
        <MarketLinks onClickOnDownloadApp={onClickOnDownloadApp} hideAndroid />,
      )

      expect(
        marketLinks.getByRole('img', {
          name: iOSImageAlte,
        }),
      ).toBeInTheDocument()
      expect(
        marketLinks.queryByRole('img', {
          name: androidImageAlte,
        }),
      ).not.toBeInTheDocument()
    })
  })

  describe('when hideIOS prop is passed as true', () => {
    it('should hide IOS store image and show Android store image', () => {
      const marketLinks = render(
        <MarketLinks onClickOnDownloadApp={onClickOnDownloadApp} hideIOS />,
      )

      expect(
        marketLinks.queryByRole('img', {
          name: iOSImageAlte,
        }),
      ).not.toBeInTheDocument()
      expect(
        marketLinks.getByRole('img', {
          name: androidImageAlte,
        }),
      ).toBeInTheDocument()
    })
  })
})
