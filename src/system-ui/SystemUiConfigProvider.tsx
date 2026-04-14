import { useTranslation } from 'react-i18next'

import { ModalsProvider } from '@mercadona/mo.library.shop-ui/modal'

export const SystemUiConfigProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { t } = useTranslation()

  return (
    <ModalsProvider closeActionLabel={t('dialog_close')}>
      {children}
    </ModalsProvider>
  )
}
