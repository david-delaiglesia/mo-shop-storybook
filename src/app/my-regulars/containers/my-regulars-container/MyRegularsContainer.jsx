import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { func, string } from 'prop-types'

import { SOURCES, SOURCE_CODES } from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { MyRegularsClient } from 'app/my-regulars/client'
import { MyRegularsEmpty } from 'app/my-regulars/components/my-regulars-empty'
import { MyRegularsHeader } from 'app/my-regulars/components/my-regulars-header'
import { MyRegularsProducts } from 'app/my-regulars/components/my-regulars-products'
import { MY_REGULARS_TYPE, SORTING_METHODS } from 'app/my-regulars/constants'
import { sendRemoveFromMyRegularsMetrics } from 'app/my-regulars/metrics'
import { hideAlert, showAlert } from 'app/shared/alert/actions'
import { ALERT_SIZES } from 'app/shared/alert/components/alert'
import { addArrayProduct } from 'pages/product/actions'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'

const MyRegularsContainer = ({
  goToCategories,
  goToRegister,
  warehouse,
  t,
}) => {
  const [productIds, setProductsIds] = useState([])
  const [productsRecommendedQuantity, setProductsRecommendedQuantity] =
    useState({})
  const initialValue =
    Storage.getShoppingListDetailOrderBy('my-regulars') ??
    SORTING_METHODS.BY_IMPORTANCE

  const [fetching, setFetching] = useState(true)
  const [sortingMethod, setSortingMethod] = useState(initialValue)

  const { uuid: userUuid, isAuth } = useSelector((state) => state.session)
  const language = useSelector((state) => state.language)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isAuth) return

    getMyRegulars()
  }, [isAuth, language])

  const getMyRegulars = async () => {
    const recommendations = await MyRegularsClient.getMyRegulars(
      userUuid,
      warehouse,
    )

    saveRecommendationsResults(recommendations)
    setFetching(false)

    return recommendations
  }

  const removeMyRegularProduct = (product) => {
    const myRegularsInfo = Storage.getItem(STORAGE_KEYS.MY_REGULARS)
    const hasAlreadyRemoved = myRegularsInfo?.productRemoved

    if (hasAlreadyRemoved) {
      removeProduct(product)
      return
    }

    const options = {
      size: ALERT_SIZES.MEDIUM,
      imageSrc: product.thumbnail,
      title: 'remove_products_title',
      description: 'remove_products_info',
      confirmButtonText: 'remove_products',
      confirmButtonAction: async () => {
        await removeProduct(product)
        dispatch(hideAlert())
      },
      secondaryActionText: 'button.cancel',
      secondaryAction: () => dispatch(hideAlert()),
      destructive: true,
    }
    dispatch(showAlert(options))
  }

  const removeProduct = async (product) => {
    const { id, display_name: displayName } = product
    sendRemoveFromMyRegularsMetrics({
      id,
      displayName,
      sourceCode: MY_REGULARS_TYPE.PRECISION,
    })

    await MyRegularsClient.removeMyRegularProduct(userUuid, id)
    await getMyRegulars()

    Storage.setItem(STORAGE_KEYS.MY_REGULARS, { productRemoved: true })
  }

  const saveRecommendationsResults = (results) => {
    if (!results) {
      setProductsIds([])
      setProductsRecommendedQuantity({})
      return
    }

    const { products, recommendations, productsArray } = results
    dispatch(addArrayProduct(products))
    setProductsRecommendedQuantity(recommendations)
    setProductsIds(productsArray)
  }

  if (!isAuth) {
    return (
      <MyRegularsEmpty
        title={t('my_products.anonymous_title')}
        buttonText={t('my_products.empty_button_text_anonymous')}
        redirect={goToRegister}
        messageText={t('my_products.empty_message_anonymous')}
      />
    )
  }

  if (fetching) {
    return null
  }

  const hasRecommendations = productIds.length > 0

  if (!hasRecommendations) {
    return (
      <MyRegularsEmpty
        title={t('my_products.empty_title')}
        buttonText={t('my_products.empty_button_text')}
        redirect={goToCategories}
        messageText={t('my_products.empty_message')}
      />
    )
  }

  return (
    <div className="my-regulars-container">
      <MyRegularsHeader
        sortingMethod={sortingMethod}
        setSortingMethod={setSortingMethod}
      />
      <MyRegularsProducts
        source={SOURCES.MY_REGULARS}
        sourceCode={SOURCE_CODES.MY_REGULARS}
        products={productIds}
        recommendations={productsRecommendedQuantity}
        removeMyRegularProduct={removeMyRegularProduct}
        sortingMethod={sortingMethod}
      />
    </div>
  )
}

MyRegularsContainer.propTypes = {
  t: func.isRequired,
  goToCategories: func.isRequired,
  goToRegister: func,
  warehouse: string.isRequired,
}

const ComposedMyRegulars = withTranslate(MyRegularsContainer)

export { ComposedMyRegulars as MyRegularsContainer }
