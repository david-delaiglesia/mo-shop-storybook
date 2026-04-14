import { Component } from 'react'
import { connect } from 'react-redux'

import { func, node } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { NAVBAR_HEIGHT } from 'system-ui/constants'

import './assets/Layout.css'

class Layout extends Component {
  componentDidMount = () => {
    this.props.setHeaderType(LayoutHeaderType.DEFAULT)
  }

  render = () => {
    const marginTop = `${NAVBAR_HEIGHT}px`
    const minHeight = `calc(100vh - ${marginTop})`

    return (
      <div style={{ marginTop, minHeight }} className="layout-fluid">
        {this.props.children}
      </div>
    )
  }
}

Layout.propTypes = {
  children: node.isRequired,
  setHeaderType: func.isRequired,
}

const mapDispatchToProps = {
  setHeaderType,
}

const ComposedLayout = compose(connect(null, mapDispatchToProps))(Layout)

export default ComposedLayout
