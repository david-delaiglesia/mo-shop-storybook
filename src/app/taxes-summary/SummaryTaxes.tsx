import { useTranslation } from 'react-i18next'

import { useCheckoutContext } from 'app/checkout'
import { SummaryResponse, TaxType } from 'app/shared/summary'
import { TAB_INDEX } from 'utils/constants'

import './SummaryTaxes.css'

type SummaryTaxesProps = {
  summary: Pick<SummaryResponse, 'tax_type' | 'taxes'>
  textClassName?: string
}

const SummaryTaxes = ({ summary }: SummaryTaxesProps) => {
  const { t } = useTranslation()
  const { checkout } = useCheckoutContext()

  if (!summary?.tax_type) {
    return null
  }

  const TAX_TYPE_TEXT: Record<TaxType, string> = {
    [TaxType.IGIC]: t('commons.order.summary.igic_taxes'),
    [TaxType.IPSI]: t('summary_ipsi_title'),
    [TaxType.IVA]: t('commons.order.summary.taxes'),
  }

  const isCheckout = !!checkout

  return (
    <span className="summary-taxes">
      <p
        className="caption2-sb summary-taxes__tax"
        tabIndex={TAB_INDEX.ENABLED}
      >
        {TAX_TYPE_TEXT[summary.tax_type]}
      </p>
      {isCheckout && (
        <p className="caption2-sb" tabIndex={TAB_INDEX.ENABLED}>
          {t('commons.order.summary.variable-price-weight-products')}
        </p>
      )}
    </span>
  )
}

export { SummaryTaxes }
