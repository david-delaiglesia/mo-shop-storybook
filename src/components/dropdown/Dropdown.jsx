import { withClickOutside } from '../../wrappers/click-out-handler'
import { bool, func, node, string } from 'prop-types'

import './styles/Dropdown.css'

export const DROPDOWN_CONTENT_CLASS = 'dropdown__content'

const Dropdown = ({
  header,
  content,
  open,
  toggleDropdown,
  datatest,
  ariaLabel,
  disabled,
}) => {
  return (
    <div className="drop-down" data-testid={datatest}>
      <button
        type="button"
        className="drop-down__trigger"
        aria-haspopup={true}
        onClick={toggleDropdown}
        data-testid="dropdown-button"
        aria-label={ariaLabel}
        disabled={disabled}
      >
        {header}
      </button>
      {open && (
        <div className={DROPDOWN_CONTENT_CLASS} data-testid="dropdown-content">
          {content}
        </div>
      )}
    </div>
  )
}

Dropdown.defaultProps = {
  datatest: 'drop-down',
}

Dropdown.propTypes = {
  content: node.isRequired,
  header: node.isRequired,
  open: bool.isRequired,
  toggleDropdown: func.isRequired,
  datatest: string,
  ariaLabel: string,
  disabled: bool,
}

export default Dropdown

export const DropdownWithClickOut = withClickOutside(Dropdown)
