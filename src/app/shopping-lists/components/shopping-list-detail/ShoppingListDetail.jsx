import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { EmptyShoppingList } from './EmptyShoppingList'
import { ShoppingListDetailHeader } from './ShoppingListDetailHeader'
import { OrderByCategoryList } from './components/order-by-category-list'
import { SuggestionsList } from './components/suggestions-list'
import { useShoppingListDetail } from './hooks/useShoppingListDetail'
import { useSuggestions } from './hooks/useSuggestions'
import { useSuggestionsScroll } from './hooks/useSuggestionsScroll'
import { useShoppingListId } from './useShoppingListId'
import { bool, func } from 'prop-types'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'
import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import { useAccessibilityFeedback } from 'app/accessibility'
import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { ProductCellSwitch } from 'app/catalog/components/product-cell-switch'
import { LAYOUTS, SOURCES, SOURCE_CODES } from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import { MyRegularsEmpty } from 'app/my-regulars/components/my-regulars-empty'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { SORTING_METHODS } from 'app/shopping-lists/constants'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { ShoppingListsProvider } from 'app/shopping-lists/infra/shopping-lists-provider'
import { goToRegister } from 'app/shopping-lists/utils'
import { Storage } from 'services/storage/storage.js'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'
import { RecommendationProvider } from 'wrappers/recommendation-provider'

import './ShoppingListDetail.css'

const EMPTY_RECOMMENDATIONS = {}

const ShoppingListDetail = ({
  t,
  displayHeaderActions = true,
  displaySuggestions = true,
}) => {
  const { listId } = useShoppingListId()
  const userUuid = useSelector((state) => state?.session?.uuid)
  const history = useHistory()
  const [sortingMethod, setSortingMethod] = useState(
    Storage.getShoppingListDetailOrderBy(listId) ?? SORTING_METHODS.TIME,
  )
  const [isPolling, setIsPolling] = useState(true)
  const suggestionCardRef = useRef(null)

  const { setFeedbackText } = useAccessibilityFeedback()

  const { listDetail, reFetchListDetail, reFetchListDetailFromSuggestion } =
    useShoppingListDetail({
      setIsPolling,
      suggestionCardRef,
    })

  const {
    suggestions,
    isAssistedList,
    isLoadingSuggestions,
    isDisplaySkeleton,
  } = useSuggestions({ listDetail, isPolling, setIsPolling })

  useSuggestionsScroll({
    listId,
    listDetail,
    suggestions,
    suggestionCardRef,
  })

  if (!userUuid) {
    return (
      <>
        <SignInModal />
        <MyRegularsEmpty
          title={t('shopping_lists.logged_out_user.title')}
          messageText={t('shopping_lists.logged_out_user.message_text')}
          buttonText="Login"
          redirect={() => goToRegister(history)}
        />
      </>
    )
  }

  if (!listDetail || isLoadingSuggestions) {
    return (
      <div className="shopping-list-detail__loader">
        <Loader ariaLabel="cargando el contenido de la lista" />
      </div>
    )
  }

  const removeMyRegularProduct = async ({ id: productId }) => {
    await ShoppingListsClient.deleteProductFromShoppingList(
      userUuid,
      listId,
      productId,
    )
    await reFetchListDetail()

    const deletedProductPosition = listDetail.items.findIndex(
      (item) => item.product.id === productId,
    )
    ShoppingListsMetrics.deleteFromListButtonClick(
      productId,
      listId,
      listDetail.name,
      deletedProductPosition,
    )
    setFeedbackText(t('accessibility.product_removed_from_list_feedback'))
  }

  const productsIds = listDetail.items.map((item) => {
    return item.product.id
  })

  const isSortByCategory = sortingMethod === SORTING_METHODS.CATEGORY

  return (
    <>
      <ShoppingListsProvider
        productsIds={productsIds}
        reFetchListDetail={reFetchListDetail}
        listName={listDetail.name}
        productsQuantity={listDetail.products_quantity}
      >
        <ShoppingListDetailHeader
          listDetail={listDetail}
          sortingMethod={sortingMethod}
          setSortingMethod={setSortingMethod}
          displayHeaderActions={displayHeaderActions}
          reFetchListDetail={reFetchListDetail}
        />
        <ProductMetricsContext.Provider
          value={{
            sourceCode: SOURCE_CODES.SHOPPING_LIST,
            source: SOURCES.SHOPPING_LIST,
            layout: LAYOUTS.GRID,
          }}
        >
          <div className="shopping-list-detail__products-section">
            <RecommendationProvider
              removeMyRegularProduct={removeMyRegularProduct}
              recommendations={EMPTY_RECOMMENDATIONS}
            >
              {listDetail.products_quantity === 0 && <EmptyShoppingList />}
              {isSortByCategory && (
                <OrderByCategoryList listDetail={listDetail} />
              )}
              {!isSortByCategory &&
                listDetail.items.map((item, index) => {
                  return (
                    <ProductCellSwitch
                      key={item.product.id}
                      productId={item.product.id}
                      order={index}
                    />
                  )
                })}
            </RecommendationProvider>
          </div>
        </ProductMetricsContext.Provider>

        {displaySuggestions && !isLoadingSuggestions && isAssistedList && (
          <SuggestionsList
            isDisplaySkeleton={isDisplaySkeleton}
            suggestionCardRef={suggestionCardRef}
            suggestions={suggestions}
            reFetchListDetailFromSuggestion={reFetchListDetailFromSuggestion}
            setIsPolling={setIsPolling}
            isPolling={isPolling}
            listDetailName={listDetail?.name}
          />
        )}
      </ShoppingListsProvider>
    </>
  )
}

ShoppingListDetail.propTypes = {
  t: func,
  displayHeaderActions: bool,
  displaySuggestions: bool,
}

const ShoppingListDetailWithTranslate = withTranslate(ShoppingListDetail)

const ShoppingListDetailWithFooter = () => {
  const paddingTop = `${NAVBAR_HEIGHT}px`
  const content = <ShoppingListDetailWithTranslate />
  const footer = <Footer />

  return (
    <>
      <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
    </>
  )
}

const ShoppingListDetailNoLayout = () => {
  const { t } = useTranslation()

  return (
    <ShoppingListDetail
      t={t}
      displayHeaderActions={false}
      displaySuggestions={false}
    />
  )
}

export {
  ShoppingListDetailWithFooter as ShoppingListDetail,
  ShoppingListDetailNoLayout,
}
