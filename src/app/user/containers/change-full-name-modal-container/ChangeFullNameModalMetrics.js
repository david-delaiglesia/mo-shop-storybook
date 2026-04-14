import { PureComponent } from 'react'

import { func } from 'prop-types'

class ChangeFullNameModalMetrics extends PureComponent {
  constructor(props) {
    super(props)

    this.metricsEvents = {
      onConfirm: this.changeFullName.bind(this),
      onEnterKeyPress: this.onEnterKeyPress.bind(this),
    }
  }

  changeFullName() {
    this.props.onConfirm()
  }

  onEnterKeyPress() {
    this.props.onEnterKeyPress()
  }

  render() {
    return this.props.children(this.metricsEvents)
  }
}

ChangeFullNameModalMetrics.propTypes = {
  children: func.isRequired,
  onConfirm: func,
  onEnterKeyPress: func,
}

export default ChangeFullNameModalMetrics
