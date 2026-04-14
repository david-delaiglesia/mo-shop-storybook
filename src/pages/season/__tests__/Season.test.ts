import { screen } from '@testing-library/react'

import {
  clickOnPostalCode,
  confirmAddressForm,
  openUserMenu,
} from '../../home/__tests__/helpers'
import {
  changeLanguage,
  goToCategories,
  goToMyLists,
  openUserAddress,
} from './helpers'
import { NetworkResponses, configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  address,
  addressFromDifferentWarehouse,
} from 'app/address/__scenarios__/address'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { englishSeason, season } from 'app/catalog/__scenarios__/seasons'
import { newArrivals } from 'app/catalog/__scenarios__/sections'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

interface CustomHeaders extends Headers {
  'x-customer-pc': string
  'x-customer-wh': string
}

describe('Season', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    Cookie.get = vi
      .fn()
      .mockReturnValue({ language: 'en', postalCode: '46010' })
    vi.useFakeTimers()
    global.IntersectionObserver =
      IntersectionObserverMock as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should navigate to categories page', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: season },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')
    goToCategories()
    const [categoryTitle] = await screen.findAllByText('Aceite, vinagre y sal')

    expect(categoryTitle).toBeInTheDocument()
  })

  it('should navigate to the lists page', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: season },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')
    goToMyLists()
    const title = await screen.findByRole('heading', {
      name: 'Lists',
      level: 1,
    })

    expect(title).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create new list' }),
    ).toBeInTheDocument()
  })

  it('should show season detail', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/31/', responseBody: season },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')

    expect(screen.getByText('Para tu San Valentín')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('season', {
      season_id: 31,
    })
  })

  it('should show the home page when the user changes the address in the season page', async () => {
    const mad1PostalCode = '28001'
    const responses: NetworkResponses = [
      {
        path: '/customers/1/home/seasons/31/?lang=en&wh=vlc1',
        responseBody: season,
      },
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/3/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: { ...addressFromDifferentWarehouse },
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: '/customers/1/home/seasons/31/?lang=en&wh=mad1',
        method: 'get',
        status: 404,
        responseBody: '',
      },
      {
        path: '/customers/1/home/?lang=en&wh=mad1',
        responseBody: homeWithGrid,
      },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Para tu San Valentín')
    confirmAddressForm()

    openUserMenu('John')
    openUserAddress('46010')

    await screen.findByRole('dialog')
    await screen.findByText('Where do you want to receive your order?')

    clickOnPostalCode(mad1PostalCode)
    confirmAddressForm()

    expect(await screen.findByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Para tu San Valentín')).toBeInTheDocument()
  })

  it('should show section detail', async () => {
    const responses = [
      { path: '/customers/1/home/new-arrivals/', responseBody: newArrivals },
    ]
    wrap(App)
      .atPath('/home/new-arrivals')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Novedades')

    expect(screen.getByText('Novedades')).toBeInTheDocument()
    expect(Tracker.sendViewChange).not.toHaveBeenCalledWith(
      'season',
      expect.any(Object),
    )
  })

  it('should redirect to the home page if there is not season detail', async () => {
    const responses = [
      { path: '/customers/1/home/seasons/999/', status: 404 },
      {
        path: '/customers/1/home/?lang=en&wh=vlc1',
        responseBody: homeWithGrid,
      },
    ]
    wrap(App)
      .atPath('/home/seasons/999')
      .withNetwork(responses)
      .withLogin()
      .mount()

    expect(
      await screen.findByRole('heading', {
        name: 'Mercadona online shopping',
      }),
    ).toBeInTheDocument()
  })

  it('should update the season detail info when the language changes', async () => {
    const responses = [
      {
        path: '/customers/1/home/seasons/31/?lang=es&wh=vlc1',
        responseBody: season,
        catchParams: true,
      },
      {
        path: '/customers/1/home/seasons/31/?lang=en&wh=vlc1',
        responseBody: englishSeason,
        catchParams: true,
      },
    ]
    wrap(App)
      .atPath('/home/seasons/31')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('For your Valentine')
    changeLanguage('Spanish')
    const englishSeasonTitle = await screen.findByText('Para tu San Valentín')

    expect(englishSeasonTitle).toBeInTheDocument()
    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
  })

  it('should track the campaign if present as a query param', async () => {
    const responses = [
      { path: '/customers/1/home/new-arrivals/', responseBody: newArrivals },
    ]
    wrap(App)
      .atPath('/home/new-arrivals?campaign=verano')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Novedades')

    expect(Tracker.setUserProperties).toHaveBeenCalledWith({
      campaign: 'verano',
    })
  })
})
