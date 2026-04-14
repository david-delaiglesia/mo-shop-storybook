import { bool, func, number, oneOfType, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import './styles/SettingsCell.css'

const SettingsCell = ({
  title,
  description,
  alternativeDescription,
  hasWarningText,
  value,
  actionName,
  onClick,
  mood,
}) => (
  <li className="settings-cell">
    <div className="settings-cell__details">
      <h5 className="settings-cell__title body1-r">{title}</h5>
      {!hasWarningText && (
        <p className="settings-cell__description subhead1-r">{description}</p>
      )}
      {hasWarningText && (
        <p className="settings-cell__alternative-description subhead1-r">
          {alternativeDescription}
        </p>
      )}
      {value && (
        <p className="settings-cell__value body1-sb ym-hide-content">{value}</p>
      )}
    </div>
    {!hasWarningText && (
      <Button variant="secondary" mood={mood} onClick={onClick} size="small">
        {actionName}
      </Button>
    )}
  </li>
)

SettingsCell.propTypes = {
  title: string.isRequired,
  description: string.isRequired,
  alternativeDescription: string,
  hasWarningText: bool,
  value: oneOfType([string, number]),
  actionName: string.isRequired,
  onClick: func.isRequired,
  mood: string,
}

SettingsCell.defaultProps = {
  datatest: 'positive',
  alternativeDescription: null,
  hasWarningText: false,
}

export default SettingsCell
