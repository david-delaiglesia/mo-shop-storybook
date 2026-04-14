import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import {
  LAYOUT,
  SECTION_LAYOUT,
  SECTION_LAYOUT_WITH_HIGHLIGHTED_GROUP,
} from './helpers/helpers'

import { useSession } from 'app/authentication'
import { CatalogClient } from 'app/catalog/client'
import { normalizeProductList } from 'app/catalog/normalizer'
import { WhatsNew as ShoppingListsWhatsNew } from 'app/shopping-lists/components/whats-new'
import { addArrayProduct } from 'pages/product/actions'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

const HomeSections = () => {
  const [sections, setSections] = useState([])
  const { postalCode, uuid, isAuth, warehouse } = useSession()
  const language = useSelector((state) => state.language)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const isHighlightedGroupEnabled = useFlag(
    knownFeatureFlags.WEB_HIGHLIGHTED_GROUP,
  )
  const isVideoSectionEnabled = useFlag(knownFeatureFlags.WEB_VIDEO_SECTION)

  useEffect(() => {
    getSectionsAndSaveProducts()
  }, [warehouse, language, uuid])

  const getSectionsAndSaveProducts = async () => {
    const sections = await getSections()

    if (!sections) return

    setSections(sections)
    if (isHighlightedGroupEnabled) {
      saveProductsFromSectionsWithHighlightedGroup(sections)
      return
    }
    saveProductsFromSections(sections)
  }

  const getSections = async () => {
    if (!isAuth) {
      const sections = await CatalogClient.getHomeSections(
        postalCode,
        isHighlightedGroupEnabled,
      )

      return sections
    }

    const sections = await CatalogClient.getAuthHomeSections(
      uuid,
      isHighlightedGroupEnabled,
    )

    return sections
  }

  const getProductsFromSections = (sections) => {
    const layoutsWithProducts = [
      LAYOUT.GRID,
      LAYOUT.CAROUSEL,
      LAYOUT.HIGHLIGHTED,
      LAYOUT.VIDEO,
    ]

    const sectionsWithProducts = sections.filter((section) =>
      layoutsWithProducts.includes(section.layout),
    )
    const products = sectionsWithProducts.reduce(
      (totalProducts, { content }) => {
        return [...totalProducts, ...content.items]
      },
      [],
    )
    return products
  }

  const getHighlightedGroupProductsFromSections = (sections) => {
    const highlightedGroupSections = sections.filter(
      (section) => section.layout === LAYOUT.HIGHLIGHTED_GROUP,
    )
    const products = highlightedGroupSections.reduce(
      (totalProducts, { content }) => {
        return [...totalProducts, ...content.items.map((item) => item.product)]
      },
      [],
    )

    return products
  }

  const saveProductsFromSections = (sections) => {
    const products = getProductsFromSections(sections)
    if (products.length === 0) return

    const normalizedProducts = normalizeProductList(products)
    dispatch(addArrayProduct(normalizedProducts))
  }

  const saveProductsFromSectionsWithHighlightedGroup = (sections) => {
    const products = getProductsFromSections(sections)
    const highlightedGroupProducts =
      getHighlightedGroupProductsFromSections(sections)

    const allProducts = [...products, ...highlightedGroupProducts]
    if (allProducts.length === 0) return

    const normalizedProducts = normalizeProductList(allProducts)
    dispatch(addArrayProduct(normalizedProducts))
  }

  return (
    <Fragment>
      <h1 className="ui-hidden" id="content">
        {t('home_title')}
      </h1>
      {sections.map(({ _id, layout, content }, index) => {
        if (layout === LAYOUT.VIDEO && !isVideoSectionEnabled) return null
        const sectionLayout = isHighlightedGroupEnabled
          ? SECTION_LAYOUT_WITH_HIGHLIGHTED_GROUP[layout]
          : SECTION_LAYOUT[layout]
        if (!sectionLayout) return null

        const { Section, getProps } = sectionLayout
        return (
          <Section key={_id} {...getProps(content)} sectionPosition={index} />
        )
      })}
      <ShoppingListsWhatsNew />
    </Fragment>
  )
}

export { HomeSections }
