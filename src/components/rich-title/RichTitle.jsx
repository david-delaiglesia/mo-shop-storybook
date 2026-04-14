import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { bool, func, node, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import './assets/RichTitle.css'

export const RichTitle = ({
  labelAction,
  label,
  content,
  showEditButton,
  buttonAction,
  labeldatatest,
  showSecondaryButton = false,
  secondaryButtonText,
  secondaryButtonAction,
  subtitle,
  ...props
}) => {
  const { t } = useTranslation()

  return (
    <div className="rich-title">
      <button
        onClick={labelAction}
        className="rich-title-label"
        data-testid={labeldatatest}
        {...props}
      >
        <span className="title2-b">{label}</span>
        {content}
      </button>
      {showEditButton && (
        <Button
          variant="text"
          aria-label={t('button.edit')}
          onClick={buttonAction}
        >
          {t('button.edit')}
        </Button>
      )}
      {showSecondaryButton && (
        <Fragment>
          <Button
            variant="secondary"
            size="small"
            className="rich-title__button"
            onClick={secondaryButtonAction}
          >
            {secondaryButtonText}
          </Button>
          <p className="rich-title__subtitle footnote1-r">{subtitle}</p>
        </Fragment>
      )}
    </div>
  )
}

RichTitle.propTypes = {
  content: node,
  label: string.isRequired,
  showEditButton: bool,
  labelAction: func,
  buttonAction: func,
  labeldatatest: string.isRequired,
  showSecondaryButton: bool,
  secondaryButtonText: string,
  secondaryButtonAction: func,
  subtitle: string,
}
