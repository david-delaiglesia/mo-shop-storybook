import { ProductSection } from 'app/catalog/components/product-section'
import { LAYOUTS } from 'app/catalog/metrics'
import { Banner } from 'app/home/components/banner'
import { SectionNotification } from 'app/home/components/section-notification'
import { PendingOrder } from 'app/order/components/pending-order'
import { HighlightedGroup } from 'components/highlighted-group'
import { HighlightedProduct } from 'components/highlighted-product'
import { SectionCarousel } from 'components/section-carousel'
import { VideoSection } from 'components/video-section'

export const LAYOUT = {
  NOTIFICATION: 'notification',
  WIDGET: 'widget',
  BANNER: 'banner',
  HIGHLIGHTED_GROUP: 'highlighted_group',
  HIGHLIGHTED: 'highlighted',
  GRID: 'grid',
  CAROUSEL: 'carousel',
  VIDEO: 'video',
}

export const SECTION_LAYOUT = {
  [LAYOUT.NOTIFICATION]: {
    Section: SectionNotification,
    getProps: (content) => ({ notification: content }),
  },
  [LAYOUT.WIDGET]: {
    Section: PendingOrder,
    getProps: (content) => ({ items: content.items, title: content.title }),
  },
  [LAYOUT.BANNER]: {
    Section: Banner,
    getProps: (content) => ({
      apiPaths: content.items.map((item) => item.apiPath),
      title: content.title,
      subtitle: content.subtitle,
      bannerSlides: content.items,
    }),
  },
  [LAYOUT.HIGHLIGHTED]: {
    Section: HighlightedProduct,
    getProps: (content) => {
      return {
        title: content.title,
        subtitle: content.subtitle,
        webImageUrl: content.webImageUrl,
        source: content.source,
        sourceCode: content.sourceCode,
        product: content.items[0],
        layout: LAYOUT.HIGHLIGHTED,
      }
    },
  },
  [LAYOUT.GRID]: {
    Section: ProductSection,
    getProps: (content) => ({
      name: content.title,
      subtitle: content.subtitle,
      products: content.items.map((product) => product.id),
      source: content.source,
      sourceCode: content.sourceCode,
      layout: LAYOUTS.GRID,
    }),
  },
  [LAYOUT.CAROUSEL]: {
    Section: SectionCarousel,
    getProps: (content) => ({
      name: content.title,
      subtitle: content.subtitle,
      apiPath: content.apiPath,
      apiPathText: content.apiPathText,
      products: content.items.map((product) => product.id),
      source: content.source,
      sourceCode: content.sourceCode,
      layout: LAYOUTS.CAROUSEL,
    }),
  },
  [LAYOUT.VIDEO]: {
    Section: VideoSection,
    getProps: (content) => ({
      title: content.title,
      subtitle: content.subtitle,
      webVideoUrl: content.webVideoUrl,
      apiPath: content.apiPath,
      apiPathText: content.apiPathText,
      products: content.items.map((product) => product.id),
      source: content.source,
      sourceCode: content.sourceCode,
    }),
  },
}

export const SECTION_LAYOUT_WITH_HIGHLIGHTED_GROUP = {
  [LAYOUT.NOTIFICATION]: {
    Section: SectionNotification,
    getProps: (content) => ({ notification: content }),
  },
  [LAYOUT.WIDGET]: {
    Section: PendingOrder,
    getProps: (content) => ({ items: content.items, title: content.title }),
  },
  [LAYOUT.BANNER]: {
    Section: Banner,
    getProps: (content) => ({
      apiPaths: content.items.map((item) => item.apiPath),
      title: content.title,
      subtitle: content.subtitle,
      bannerSlides: content.items,
      bannerItem: HighlightedProduct,
    }),
  },
  [LAYOUT.HIGHLIGHTED_GROUP]: {
    Section: HighlightedGroup,
    getProps: (content) => {
      return {
        title: content.title,
        subtitle: content.subtitle,
        highlightedProducts: content.items,
        source: content.source,
        sourceCode: content.sourceCode,
        layout: LAYOUT.HIGHLIGHTED_GROUP,
      }
    },
  },
  [LAYOUT.HIGHLIGHTED]: {
    Section: HighlightedProduct,
    getProps: (content) => {
      return {
        title: content.title,
        subtitle: content.subtitle,
        webImageUrl: content.webImageUrl,
        source: content.source,
        sourceCode: content.sourceCode,
        product: content.items[0],
        layout: LAYOUT.HIGHLIGHTED,
      }
    },
  },
  [LAYOUT.GRID]: {
    Section: ProductSection,
    getProps: (content) => ({
      name: content.title,
      subtitle: content.subtitle,
      products: content.items.map((product) => product.id),
      source: content.source,
      sourceCode: content.sourceCode,
      layout: LAYOUTS.GRID,
    }),
  },
  [LAYOUT.CAROUSEL]: {
    Section: SectionCarousel,
    getProps: (content) => ({
      name: content.title,
      subtitle: content.subtitle,
      apiPath: content.apiPath,
      apiPathText: content.apiPathText,
      products: content.items.map((product) => product.id),
      source: content.source,
      sourceCode: content.sourceCode,
      layout: LAYOUTS.CAROUSEL,
    }),
  },
  [LAYOUT.VIDEO]: {
    Section: VideoSection,
    getProps: (content) => ({
      title: content.title,
      subtitle: content.subtitle,
      webVideoUrl: content.webVideoUrl,
      apiPath: content.apiPath,
      apiPathText: content.apiPathText,
      products: content.items.map((product) => product.id),
      source: content.source,
      sourceCode: content.sourceCode,
    }),
  },
}
