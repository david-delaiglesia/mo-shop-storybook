import { connect } from 'react-redux'

import { object } from 'prop-types'

import { MyRegularsContext } from 'wrappers/recommendation-provider'

export function withRecommendation(WrappedComponent) {
  const WithRecommendation = (props) => (
    <MyRegularsContext.Consumer>
      {(context) => {
        const { product } = props
        if (!product) {
          return null
        }

        const recommendations = context && context.recommendations[product.id]
        const newProps = {
          ...props,
          product: { ...product, ...recommendations },
        }

        return <WrappedComponent {...newProps} />
      }}
    </MyRegularsContext.Consumer>
  )

  WithRecommendation.displayName = `withRecommendation(${getDisplayName(
    WrappedComponent,
  )})`

  WithRecommendation.propTypes = {
    product: object,
    recommendation: object,
  }

  return connect(mapStateToProps)(WithRecommendation)
}

function getDisplayName(WrappedComponent) {
  return (
    WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name)
  )
}

const mapStateToProps = (state, props) => {
  return {
    product: state.products[props.productId],
  }
}
