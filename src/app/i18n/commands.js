import { Storage } from '../../services/storage'
import { Support } from '../../services/support'
import * as actions from './actions'
import { I18nClient } from './client'

export async function initializeLanguage({ dispatch }) {
  await I18nClient.create()

  const language = I18nClient.getCurrentLanguage()
  changeLanguage(language, { dispatch })
}

export async function changeLanguage(language, { dispatch }) {
  Storage.clear()
  Support.setLocale(language)

  await I18nClient.changeLanguage(language)

  const action = actions.changeLanguage(language)
  dispatch(action)
}
