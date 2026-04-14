import { createReducer } from '@mercadona/mo.library.dashtil'

import { actionTypes } from 'app/shared/alert/actions'

const INITIAL_STATE = {
  visible: false,
  title: null,
  description: null,
  imageSrc: null,
  imageAlt: null,
  confirmButtonText: null,
}

const showAlert = (store, alertOptions) => ({
  ...alertOptions,
  visible: true,
})

const hideAlert = () => INITIAL_STATE

/**
 * @deprecated Use ModalContext instead
 */
const alert = createReducer(INITIAL_STATE, {
  [actionTypes.SHOW_ALERT]: showAlert,
  [actionTypes.HIDE_ALERT]: hideAlert,
})

export { alert }
