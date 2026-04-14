import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { CatalogClient } from 'app/catalog/client'
import { ProductSection } from 'app/catalog/components/product-section'
import { LAYOUTS, sendSeasonViewMetrics } from 'app/catalog/metrics'
import { normalizeProductList } from 'app/catalog/normalizer'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { addArrayProduct } from 'pages/product/actions'
import { NetworkError } from 'services/http'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const Season = () => {
  const [section, setSection] = useState(null)
  const { id, source } = useParams()
  const language = useSelector((state) => state.language)
  const { isAuth, uuid, warehouse } = useSelector((state) => state.session)
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.DEFAULT))
    sendViewMetrics()
  }, [])

  useEffect(() => {
    getSection()
  }, [language, warehouse])

  const sendViewMetrics = () => {
    const isSeason = !!id

    if (!isSeason) return

    sendSeasonViewMetrics(id)
  }

  const getSection = async () => {
    const section = await getSectionDetail()

    if (!section) return

    saveProductsSection(section)
    setSection(section)
  }

  const getSectionDetail = async () => {
    const queryParams = `?lang=${language}&wh=${warehouse}`
    if (isAuth) {
      try {
        return await CatalogClient.getAuthSectionDetail({
          id,
          source,
          uuid,
          queryParams,
        })
      } catch (error) {
        if (error.status === 404) {
          history.push(`/`)
          return
        }
        NetworkError.publish(error)
      }
    }

    if (!isAuth) {
      return CatalogClient.getSectionDetail({ id, source })
    }
  }

  const saveProductsSection = (section) => {
    const normalizedProducts = normalizeProductList(section.products)
    dispatch(addArrayProduct(normalizedProducts))
  }

  if (!section) return null

  const paddingTop = `${NAVBAR_HEIGHT}px`

  const content = (
    <ProductSection
      source={section.source}
      sourceCode={section.sourceCode}
      layout={LAYOUTS.GRID}
      name={section.name}
      products={section.products.map((product) => product.id)}
      sectionPosition={0}
    />
  )
  const footer = <Footer />

  return (
    <>
      <SignInModal />
      <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
    </>
  )
}

export { Season }
