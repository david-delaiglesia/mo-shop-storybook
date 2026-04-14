import { PureComponent } from 'react'

import { func, number, shape, string } from 'prop-types'

import Button from 'components/button'

import './styles/Choice.css'

class Choice extends PureComponent {
  constructor() {
    super()

    this.onClick = this.onClick.bind(this)
  }

  onClick() {
    const { rate, choice } = this.props
    const { id: answerId, label } = choice
    const answer = { answerId, label }

    rate(answer)
  }

  render() {
    return (
      <Button
        className="choice body1-r"
        datatest="choice"
        type="unstyled"
        text={this.props.choice.label}
        icon="chevron-right-16"
        onClick={this.onClick}
      />
    )
  }
}

Choice.propTypes = {
  rate: func.isRequired,
  choice: shape({
    id: number.isRequired,
    label: string,
  }).isRequired,
}

export { Choice }
