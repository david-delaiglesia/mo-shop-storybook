import { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { I18nProvider } from 'app/i18n/containers/i18n-provider'
import { createReduxStore } from 'app/redux'
import { SystemUiConfigProvider } from 'system-ui/SystemUiConfigProvider'

export const wrapper = (Component: ReactNode) => {
  return (
    <Provider store={createReduxStore()}>
      <I18nProvider>
        <SystemUiConfigProvider>{Component}</SystemUiConfigProvider>
      </I18nProvider>
    </Provider>
  )
}
