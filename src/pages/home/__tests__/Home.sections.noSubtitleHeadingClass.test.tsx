import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { HomeSectionMother } from 'app/home/__scenarios__/HomeSectionMother'
import { HomeSectionsBuilder } from 'app/home/__scenarios__/HomeSectionsBuilder'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { knownFeatureFlags } from 'services/feature-flags'

beforeEach(() => {
  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('HighlightedGroup - no-subtitle heading class', () => {
  it('should apply no-subtitle class to heading when no subtitle and flag is ON', async () => {
    activeFeatureFlags([
      knownFeatureFlags.WEB_HIGHLIGHTED_GROUP,
      knownFeatureFlags.WEB_HOME_SECTION_WITHOUT_SUBTITLE,
    ])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/home/',
          responseBody: new HomeSectionsBuilder()
            .withSection(HomeSectionMother.highlightedGroupWithoutSubtitle())
            .build(),
        },
      ])
      .mount()

    const heading = await screen.findByRole('heading', {
      name: 'Dos productos destacados',
    })
    expect(heading).toHaveClass('highlighted-product__title-no-subtitle')
  })

  it('should NOT apply no-subtitle class to heading when no subtitle and flag is OFF', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_HIGHLIGHTED_GROUP])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/home/',
          responseBody: new HomeSectionsBuilder()
            .withSection(HomeSectionMother.highlightedGroupWithoutSubtitle())
            .build(),
        },
      ])
      .mount()

    const heading = await screen.findByRole('heading', {
      name: 'Dos productos destacados',
    })
    expect(heading).not.toHaveClass('highlighted-product__title-no-subtitle')
  })
})

describe('HighlightedProduct - no-subtitle heading class', () => {
  it('should apply no-subtitle class to heading when no subtitle and flag is ON', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_HOME_SECTION_WITHOUT_SUBTITLE])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/home/',
          responseBody: new HomeSectionsBuilder()
            .withSection(HomeSectionMother.highlightedProductWithoutSubtitle())
            .build(),
        },
      ])
      .mount()

    const heading = await screen.findByRole('heading', { name: 'Es tendencia' })
    expect(heading).toHaveClass('highlighted-product__title-no-subtitle')
  })

  it('should NOT apply no-subtitle class to heading when no subtitle and flag is OFF', async () => {
    activeFeatureFlags([])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/home/',
          responseBody: new HomeSectionsBuilder()
            .withSection(HomeSectionMother.highlightedProductWithoutSubtitle())
            .build(),
        },
      ])
      .mount()

    const heading = await screen.findByRole('heading', { name: 'Es tendencia' })
    expect(heading).not.toHaveClass('highlighted-product__title-no-subtitle')
  })
})

describe('SectionCarousel - no-subtitle heading class', () => {
  it('should apply no-subtitle class to heading when no subtitle and flag is ON', async () => {
    activeFeatureFlags([knownFeatureFlags.WEB_HOME_SECTION_WITHOUT_SUBTITLE])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/home/',
          responseBody: new HomeSectionsBuilder()
            .withSection(HomeSectionMother.carouselWithoutSubtitle())
            .build(),
        },
      ])
      .mount()

    const heading = await screen.findByRole('heading', { name: 'Novedades' })
    expect(heading).toHaveClass('section-carousel__title-no-subtitle')
  })

  it('should NOT apply no-subtitle class to heading when no subtitle and flag is OFF', async () => {
    activeFeatureFlags([])

    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/home/',
          responseBody: new HomeSectionsBuilder()
            .withSection(HomeSectionMother.carouselWithoutSubtitle())
            .build(),
        },
      ])
      .mount()

    const heading = await screen.findByRole('heading', { name: 'Novedades' })
    expect(heading).not.toHaveClass('section-carousel__title-no-subtitle')
  })
})
