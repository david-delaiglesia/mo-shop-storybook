import classNames from 'classnames'
import { bool, string } from 'prop-types'

const Icon = ({ icon, datatest, className, ariaHidden }) => (
  <i
    role="img"
    className={classNames('icon', `icon-${icon}`, className)}
    data-testid={datatest}
    {...(ariaHidden ? { 'aria-hidden': true } : {})}
  />
)

Icon.propTypes = {
  icon: string.isRequired,
  datatest: string,
  className: string,
  ariaHidden: bool,
}

Icon.defaultProps = {
  datatest: 'icon',
  className: '',
  ariaHidden: false,
}

export default Icon
