import { useTranslation } from 'react-i18next'

import { func, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { PlusIcon } from 'system-ui/icons'

import './assets/AddElement.css'

const AddElement = ({ onClick, text, height = 'default' }) => {
  const { t } = useTranslation()
  return (
    <button
      className={`add-element add-element--height-${height}`}
      onClick={onClick}
      data-testid="add-element"
      aria-label={t(text)}
    >
      <div className="add-element__icon">
        <PlusIcon />
      </div>
      <span className="add-element__text">{t(text)}</span>
    </button>
  )
}

AddElement.propTypes = {
  onClick: func.isRequired,
  text: string.isRequired,
  t: func.isRequired,
  height: string,
}

export default withTranslate(AddElement)
