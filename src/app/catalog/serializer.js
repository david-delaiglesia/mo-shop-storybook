import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

export function serializeProductDetail(product) {
  const { share_url: shareUrl, ...rest } = product
  return {
    ...rest,
    shareUrl,
  }
}

export function serializeProductSimilar(productSimilarResponse) {
  const { results } = productSimilarResponse

  return results
}

function normalizeProductsSection(section) {
  if (!section) return
  return {
    ...section,
    products: section.products.map((product) => product.id),
  }
}

function getProductsFromSection(section) {
  return section.products.reduce((products, product) => {
    products[product.id] = product
    return products
  }, {})
}

function getProductsFromSections(sections) {
  return sections.reduce(
    (products, section) => ({
      ...products,
      ...getProductsFromSection(section),
    }),
    {},
  )
}

export function serializeProductsSections(sectionsResponse) {
  const sections = sectionsResponse.map(normalizeProductsSection)
  const products = getProductsFromSections(sectionsResponse)

  return { sections, products }
}

export function serializeRecommendedProductsSection(sectionsResponse) {
  const section = normalizeProductsSection(sectionsResponse)
  const products = getProductsFromSection(sectionsResponse)

  return { section, products }
}

function serializeWidget(widget) {
  return {
    ...widget,
    ...snakeCaseToCamelCase(widget),
    status: widget.status_ui,
    slot: {
      start: widget.start_date,
      end: widget.end_date,
    },
  }
}

function serializeWidgetSection(widgetSection) {
  const { title, items } = widgetSection
  return {
    title,
    items: items.map(serializeWidget),
  }
}

function serializeBanner(banner) {
  return {
    apiPath: banner.api_path,
    id: banner.id,
    name: banner.title,
    imageUrl: banner.image_url,
    buttonColor: banner.button_color,
    bgColors: banner.bg_colors,
    textColor: banner.text_color,
    campaignId: banner.campaign_id,
  }
}

function serializeBannerSection(bannerSection) {
  const { title, subtitle, items } = bannerSection
  return {
    title,
    subtitle,
    items: items.map(serializeBanner),
  }
}

function serializeHighlightedSection(hightlihgtedSection) {
  const {
    title,
    subtitle,
    source,
    source_code,
    web_image_url,
    product,
    items,
  } = hightlihgtedSection
  return {
    title,
    subtitle,
    source,
    sourceCode: source_code,
    webImageUrl: web_image_url,
    product,
    items,
  }
}

function serializeHighlightedGroupSection(highlightedGroupSection) {
  const { title, subtitle, source, source_code, product, items } =
    highlightedGroupSection
  return {
    title,
    subtitle,
    source,
    sourceCode: source_code,
    product,
    items: items.map((item) => ({
      ...item,
      webImageUrl: item.web_image_url,
      mobileImageUrl: item.mobile_image_url,
    })),
  }
}

function serializeVideoSection(videoSection) {
  const {
    title,
    subtitle,
    source,
    source_code,
    items,
    web_video_url,
    api_path,
    api_path_text,
  } = videoSection
  return {
    title,
    subtitle,
    source,
    sourceCode: source_code,
    items,
    webVideoUrl: web_video_url,
    apiPath: api_path,
    apiPathText: api_path_text,
  }
}

function serializeGridSection(gridSection) {
  const { title, subtitle, source, source_code, items } = gridSection
  return {
    title,
    subtitle,
    source,
    sourceCode: source_code,
    items,
  }
}

function serializeCarouselSection(carouselSection) {
  const {
    title,
    subtitle,
    source,
    source_code,
    items,
    api_path,
    api_path_text,
  } = carouselSection
  return {
    title,
    subtitle,
    source,
    sourceCode: source_code,
    items,
    apiPath: api_path,
    apiPathText: api_path_text,
  }
}

export function serializeHomeSections(homeResponse, isHighlightedGroupEnabled) {
  if (!homeResponse) return

  if (!homeResponse.sections) {
    return
  }

  const sectionSerializerMap = isHighlightedGroupEnabled
    ? {
        notification: snakeCaseToCamelCase,
        widget: serializeWidgetSection,
        banner: serializeBannerSection,
        grid: serializeGridSection,
        carousel: serializeCarouselSection,
        highlighted: serializeHighlightedSection,
        highlighted_group: serializeHighlightedGroupSection,
        video: serializeVideoSection,
      }
    : {
        notification: snakeCaseToCamelCase,
        widget: serializeWidgetSection,
        banner: serializeBannerSection,
        grid: serializeGridSection,
        carousel: serializeCarouselSection,
        highlighted: serializeHighlightedSection,
        video: serializeVideoSection,
      }
  const { sections } = homeResponse

  const usedSections = sections.filter(
    (section) => sectionSerializerMap[section.layout],
  )
  const serializedSections = usedSections.map((section) => {
    const { layout, content } = section
    const serializer = sectionSerializerMap[layout]
    if (!serializer) return null

    return {
      layout,
      content: serializer(content),
      _id: crypto.randomUUID(),
    }
  })

  return serializedSections
}

export function serializeHomeSection(section) {
  if (!section) return
  const { title, source, source_code, items } = section
  return {
    name: title,
    source,
    sourceCode: source_code,
    products: items,
  }
}
