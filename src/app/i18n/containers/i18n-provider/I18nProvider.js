import { Children, Component } from 'react'
import { connect } from 'react-redux'

import { initializeLanguage } from '../../commands'
import { element, func } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

class I18nProvider extends Component {
  state = {
    isI18nReady: false,
  }

  async componentDidMount() {
    await this.props.initializeLanguage()

    this.setState({ isI18nReady: true })
  }

  render() {
    if (!this.state.isI18nReady) {
      return null
    }

    return Children.only(this.props.children)
  }
}

I18nProvider.propTypes = {
  children: element.isRequired,
  initializeLanguage: func.isRequired,
}

const mapDispatchToProps = {
  initializeLanguage: createThunk(initializeLanguage),
}

const ConnectedI18nProvider = connect(null, mapDispatchToProps)(I18nProvider)

export { ConnectedI18nProvider as I18nProvider }
