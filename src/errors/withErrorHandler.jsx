import { Component } from 'react'

export function withErrorHandler(WrappedComponent) {
  class WithErrorHandler extends Component {
    catch = () => null

    render() {
      return <WrappedComponent key={1} catch={this.catch} {...this.props} />
    }
  }

  return WithErrorHandler
}
