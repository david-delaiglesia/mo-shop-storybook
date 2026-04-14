import { screen } from '@testing-library/react'

import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app'
import {
  homeWithPackProductWithDrainedWeight,
  homeWithProductFormats,
} from 'app/catalog/__scenarios__/home'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - ProductFormat', () => {
  const responses = [
    {
      path: '/home/',
      responseBody: homeWithProductFormats,
    },
  ]

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('when the product is selling by units', () => {
    it('should show unit size and size format', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText(
        'Pintalabios Velvet Nudes mate Deliplus 01 nude claro',
      )

      expect(screen.getByText('1 unit')).toBeInTheDocument()
      expect(screen.queryByText('1 unit approx.')).not.toBeInTheDocument()
    })

    it('should show unit size and size format with approx price', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Banana')

      expect(screen.getByText('90 g approx.')).toBeInTheDocument()
    })

    it('should show packaging, unit size and size format', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Judía verde redonda')

      expect(
        screen.queryByText('Bandeja 500 g approx.'),
      ).not.toBeInTheDocument()
    })

    it('should show packaging, unit size and size format with approx price', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Patata')

      expect(screen.getByText('250 g approx.')).toBeInTheDocument()
    })

    it('should show packaging, unit size and size format with drained weight', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Atún en aceite de girasol Hacendado')

      expect(screen.getByText('Lata')).toBeInTheDocument()
      expect(screen.getByText('900 g (650 g drained)')).toBeInTheDocument()
    })

    it('should show packaging, unit size and size format with drained field', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Chipirón puntilla')

      expect(screen.getByText('450 g drained')).toBeInTheDocument()
    })

    it('should show packaging, unit size and size format with drained field and approx price', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Filete de salmón rosado')

      expect(screen.getByText('300 g approx. drained')).toBeInTheDocument()
    })

    it('should show total units and unit name', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Papel higiénico acolchado')

      expect(screen.getByText('6 rollos')).toBeInTheDocument()
    })

    it('should show total units and unit name with unit size and size format', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Pan estrellado')

      expect(screen.getByText('1 ud. (90 g)')).toBeInTheDocument()
    })

    it('should show total units and unit name with unit size, size format and approx size', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Rosquillas al cacao')

      expect(screen.getByText('2 ud. (64 g approx.)')).toBeInTheDocument()
    })

    it('should show total units and unit name with pack size and size format', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Leche semidesnatada')

      expect(screen.getByText('6 bricks x 1 L')).toBeInTheDocument()
    })

    it('should show the packaging, total units and unit name with unit size and size format', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Galletas rellenas de naranja')

      expect(screen.getByText('2 bandejas (300 g)')).toBeInTheDocument()
    })

    it('should show the packaging, total units and unit name with drained weight and size format', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Lomos de salmón de Noruega')

      expect(screen.getByText('2 ud. (250 g drained)')).toBeInTheDocument()
    })

    it('should show drained weight for packs', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork({
          path: '/home/',
          responseBody: homeWithPackProductWithDrainedWeight,
        })
        .mount()

      await screen.findByText('Atún en aceite de girasol Hacendado')

      expect(
        screen.getByText('6 latas x 80 g (60 g drained)'),
      ).toBeInTheDocument()
    })
  })

  describe('when the product is selling by bulk', () => {
    it('should show the packaging and the units with approx price', async () => {
      wrap(App).atPath('/').withNetwork(responses).mount()

      await screen.findByText('Judía verde plana')

      expect(screen.getByText('150 g approx.')).toBeInTheDocument()
    })
  })
})
