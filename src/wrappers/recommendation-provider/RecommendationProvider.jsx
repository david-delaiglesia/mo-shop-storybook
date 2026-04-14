import { createContext, useContext } from 'react'

import { func, node, object } from 'prop-types'

const MyRegularsContext = createContext()

const RecommendationProvider = ({
  recommendations,
  children,
  removeMyRegularProduct,
}) => (
  <MyRegularsContext.Provider
    value={{ recommendations, removeMyRegularProduct }}
  >
    {children}
  </MyRegularsContext.Provider>
)

RecommendationProvider.propTypes = {
  recommendations: object,
  children: node,
  removeMyRegularProduct: func,
}

function useMyRegulars() {
  const myRegularContext = useContext(MyRegularsContext)
  return myRegularContext
}

export { RecommendationProvider, MyRegularsContext, useMyRegulars }
