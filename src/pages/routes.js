import { ShoppingListDetail } from 'app/shopping-lists/components/shopping-list-detail'
import { Addresses } from 'pages/addresses'
import { AuthenticateUser } from 'pages/authenticate-user'
import { Category, CategoryRedirect } from 'pages/category'
import { CheckoutPage } from 'pages/checkout'
import { CreateCheckout } from 'pages/create-checkout'
import { Error404 } from 'pages/error404'
import { Error500 } from 'pages/error500'
import { Home } from 'pages/home'
import { Invoices } from 'pages/invoices'
import { MyRegulars } from 'pages/my-regulars'
import { OrderProducts } from 'pages/order-products'
import { PasswordRecovery } from 'pages/password-recovery'
import { PATHS } from 'pages/paths'
import { PaymentMethods } from 'pages/payment-methods'
import { PersonalInfo } from 'pages/personal-info'
import { Product } from 'pages/product'
import { PurchaseConfirmationPage } from 'pages/purchase-confirmation'
import { Search } from 'pages/search'
import { Season } from 'pages/season'
import { ServiceRating } from 'pages/service-rating'
import { ShoppingLists } from 'pages/shopping-lists'
import { UserArea } from 'pages/user-area'

export const rootRoutes = {
  HOME: {
    path: PATHS.HOME,
    component: Home,
    exact: true,
  },
  HELP: {
    path: PATHS.HELP,
    component: Home,
    exact: true,
  },
  SEASON: {
    path: PATHS.SEASON,
    component: Season,
  },
  CATEGORIES: {
    path: PATHS.CATEGORIES,
    component: CategoryRedirect,
    exact: true,
  },
  CATEGORY: {
    path: PATHS.CATEGORY,
    component: Category,
    exact: true,
  },
  MY_REGULARS: {
    path: PATHS.MY_REGULARS,
    component: MyRegulars,
  },
  SEARCH_RESULTS: {
    path: PATHS.SEARCH_RESULTS,
    component: Search,
  },
  PRODUCT: {
    path: PATHS.PRODUCT,
    component: Product,
    exact: true,
  },
  PRODUCT_SLUG: {
    path: PATHS.PRODUCT_SLUG,
    component: Product,
    exact: true,
  },
  AUTHENTICATE_USER: {
    path: PATHS.AUTHENTICATE_USER,
    component: AuthenticateUser,
  },
  USER_AREA_PERSONAL_INFO: {
    path: PATHS.USER_AREA_PERSONAL_INFO,
    component: PersonalInfo,
  },
  USER_AREA_ADDRESS: {
    path: PATHS.USER_AREA_ADDRESS,
    component: Addresses,
    exact: true,
  },
  USER_AREA_PAYMENTS: {
    path: PATHS.USER_AREA_PAYMENTS,
    component: PaymentMethods,
    exact: true,
  },
  USER_AREA_INVOICES: {
    path: PATHS.USER_AREA_INVOICES,
    component: Invoices,
  },
  USER_AREA: {
    path: PATHS.USER_AREA,
    component: UserArea,
  },
  CREATE_CHECKOUT: {
    path: PATHS.CREATE_CHECKOUT,
    component: CreateCheckout,
    exact: true,
  },
  CHECKOUT: {
    path: PATHS.CHECKOUT,
    component: CheckoutPage,
    exact: true,
  },
  SHOPPING_LISTS: {
    path: PATHS.SHOPPING_LISTS,
    component: ShoppingLists,
    exact: true,
  },
  SHOPPING_LISTS_MY_REGULARS: {
    path: PATHS.SHOPPING_LISTS_MY_REGULARS,
    component: MyRegulars,
    exact: true,
  },
  SHOPPING_LISTS_DETAIL: {
    path: PATHS.SHOPPING_LISTS_DETAIL,
    component: ShoppingListDetail,
    exact: true,
  },
  PURCHASE_CONFIRMATION: {
    path: PATHS.PURCHASE_CONFIRMATION,
    component: PurchaseConfirmationPage,
  },
  EDIT_ORDER_PRODUCTS: {
    path: PATHS.EDIT_ORDER_PRODUCTS,
    component: OrderProducts,
  },
  PASSWORD_RECOVERY: {
    path: PATHS.PASSWORD_RECOVERY,
    component: PasswordRecovery,
  },
  SERVICE_RATING: {
    path: PATHS.SERVICE_RATING,
    component: ServiceRating,
  },
  NOT_FOUND: {
    path: PATHS.NOT_FOUND,
    component: Error404,
  },
  SERVER_ERROR: {
    path: PATHS.SERVER_ERROR,
    component: Error500,
  },
}
