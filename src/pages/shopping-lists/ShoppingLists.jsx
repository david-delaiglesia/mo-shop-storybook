import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { ShoppingLists as ShoppingListImplementation } from 'app/shopping-lists'
import { ShoppingListsTabs } from 'app/shopping-lists/components/shopping-lists-tabs'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const ShoppingLists = () => {
  const isShoppingListsTabsEnabled = useFlag(
    knownFeatureFlags.SHOPPING_LISTS_TABS,
  )
  const paddingTop = `${NAVBAR_HEIGHT}px`
  const shoppingListsContent = <ShoppingListImplementation />
  const content = isShoppingListsTabsEnabled ? (
    <ShoppingListsTabs>{shoppingListsContent}</ShoppingListsTabs>
  ) : (
    shoppingListsContent
  )
  const footer = <Footer />

  return (
    <>
      <SignInModal />
      <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
    </>
  )
}

export { ShoppingLists }
