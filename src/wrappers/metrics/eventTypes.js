import { EVENTS as CATALOG_EVENTS } from 'app/catalog/metrics'

const eventTypes = {
  ...CATALOG_EVENTS,
  VIEW_MORE_CLICK: 'view_more_click',
  LOGOUT_CLICK: 'logout_click',
  CATEGORY_CLICK: 'category_click',
  ADDRESS_MANUAL_INVALID: 'address_manual_invalid',
  CHANGE_PAYMENT_METHOD_CLICK: 'change_payment_method_click',
  CHANGE_TELEPHONE_CLICK: 'change_telephone_click',
  PHONE_NUMBER_SAVE_CLICK: 'phone_number_save_click',
  PRICE_DETAIL_CLICK: 'price_detail_click',
  CHANGE_EMAIL_CLICK: 'change_email_click',
  CHANGE_EMAIL_SAVE_BUTTON_CLICK: 'change_email_save_button_click',
  CHANGE_EMAIL_CANCEL_BUTTON_CLICK: 'change_email_cancel_button_click',
  EDIT_ADDRESS_CLICK: 'edit_address_click',
  DELETE_PAYMENT_CLICK: 'delete_payment_click',
  MAKE_DEFAULT_PAYMENT_CLICK: 'make_default_payment_click',
  REPEAT_PURCHASE_COMPLETED: 'repeat_purchase_completed',
  START_CHECKOUT_CLICK: 'start_checkout_click',
  TICKET_DOWNLOAD_CLICK: 'ticket_download_click',
  SERVICE_RATING_DETAIL_ORDER_BUTTON_CLICK:
    'order_detail_service_rating_button_click',
  SERVICE_RATING_CLOSE_BUTTON_CLICK: 'service_rating_close_button_click',
  DOWNLOAD_INVOICE_CLICK: 'invoice_click',
  OPEN_IN_APP_CLICK: 'open_in_app_click',
  CHANGE_ADDRESS_SUBMIT_CLICK: 'change_address_submit_click',
  MY_ORDERS_SEE_PRODUCTS_CLICK: 'my_orders_see_products_click',
  SUBSTITUTION_PRODUCT_DETAIL_CLICK: 'substitution_product_detail_click',
}

export default eventTypes
