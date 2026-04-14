import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { goToRegister } from './utils'
import { monitoring } from 'monitoring'
import PropTypes from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { MyRegularsEmpty } from 'app/my-regulars/components/my-regulars-empty'
import { CreateShoppingListDialog } from 'app/shopping-lists/components/create-shopping-list-dialog'
import { MyEssentialsItem } from 'app/shopping-lists/components/my-essentials-item'
import { ShoppingListItem } from 'app/shopping-lists/components/shopping-list-item'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { SHOPPING_LISTS_SOURCE } from 'app/shopping-lists/infra/metrics'
import AddElement from 'app/user/components/add-element'
import { useIsVisible } from 'hooks/useIsVisible'
import { PATHS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'

import './ShoppingLists.css'

const ShoppingLists = ({ t }) => {
  const isShoppingListsTabsEnabled = useFlag(
    knownFeatureFlags.SHOPPING_LISTS_TABS,
  )
  const userUuid = useSelector((state) => state?.session?.uuid)
  const history = useHistory()

  const {
    setElementObserved: setCreateNewListButtonRef,
    isVisible: isCreateNewListButtonVisible,
  } = useIsVisible()

  const [response, setResponse] = useState({ shoppingLists: [] })
  const [isFormVisible, displayForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTopCreateListButtonVisible, setIsTopCreateListButtonVisible] =
    useState(false)

  useEffect(() => {
    if (!isCreateNewListButtonVisible) {
      setIsTopCreateListButtonVisible(true)
    }
  }, [isCreateNewListButtonVisible])

  const sendLogIfResponseIsUndefined = (response) => {
    if (!response?.shoppingLists) {
      const responseObject = response ? response : 'empty response'
      monitoring.sendMessage(
        `Shopping lists response doesn't have shoppingLists: ${JSON.stringify(responseObject)}`,
      )
    }
  }

  const fetchShoppingLists = async () => {
    setIsLoading(true)
    try {
      const response = await ShoppingListsClient.getAll(userUuid)
      sendLogIfResponseIsUndefined(response)
      setResponse(response)
      ShoppingListsMetrics.listsView(response?.shoppingLists?.length)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userUuid) {
      fetchShoppingLists()
    }
  }, [userUuid])

  if (!userUuid) {
    return (
      <MyRegularsEmpty
        title={t('shopping_lists.logged_out_user.title')}
        messageText={t('shopping_lists.logged_out_user.message_text')}
        buttonText={t('my_products.empty_button_text_anonymous')}
        redirect={() => goToRegister(history)}
      />
    )
  }

  const createShoppingList = async (userUuid, listName, displayError) => {
    const navigateToListDetail = (listId) => {
      history.push(`${PATHS.SHOPPING_LISTS}/${listId}`)
    }

    try {
      const listId = await ShoppingListsClient.createList(userUuid, listName)
      displayForm(false)
      ShoppingListsMetrics.saveNewListButtonClick(
        listName,
        SHOPPING_LISTS_SOURCE,
      )

      navigateToListDetail(listId)
    } catch {
      displayError()
    }
  }

  const displayCreateListDialog = () => {
    displayForm(true)
    ShoppingListsMetrics.createNewListButtonClick(SHOPPING_LISTS_SOURCE)
  }

  return (
    <div className="shopping-lists">
      <div className="shopping-lists__content">
        <div className="shopping-lists__header">
          <FocusedElementWithInitialFocus>
            <h1>{t('shopping_lists.title')}</h1>
          </FocusedElementWithInitialFocus>
          {isTopCreateListButtonVisible && (
            <Button size="medium" onClick={displayCreateListDialog}>
              {t('shopping_lists.create.title')}
            </Button>
          )}
        </div>
        {isLoading && (
          <div className="shopping-lists__loader">
            <Loader ariaLabel="cargando las listas" />
          </div>
        )}
        {!isLoading && (
          <div className="shopping_lists__grid">
            {!isShoppingListsTabsEnabled && <MyEssentialsItem t={t} />}
            {response?.shoppingLists?.map((list, index) => {
              return (
                <ShoppingListItem
                  key={list.id}
                  id={list.id}
                  name={list.name}
                  productsQuantity={list.productsQuantity}
                  thumbnailImages={list.thumbnailImages}
                  order={index}
                />
              )
            })}
            <div ref={setCreateNewListButtonRef}>
              <AddElement
                onClick={displayCreateListDialog}
                text={'shopping_lists.create.new_list_title'}
                height="shopping-lists"
              />
            </div>
          </div>
        )}
      </div>
      {isFormVisible && (
        <CreateShoppingListDialog
          onCreate={createShoppingList}
          onCancel={() => displayForm(false)}
        />
      )}
    </div>
  )
}

ShoppingLists.propTypes = {
  t: PropTypes.func,
}

const ShoppingListsWithTransalate = withTranslate(ShoppingLists)

export { ShoppingListsWithTransalate as ShoppingLists }
