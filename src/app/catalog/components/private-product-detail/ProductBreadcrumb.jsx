import { Link } from 'react-router-dom'

import { array } from 'prop-types'

import { getAriaLabelForProductBreadcrumb } from 'app/accessibility'
import { sendBreadcrumbClickMetrics } from 'app/product-detail/metrics'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'

const getCategoryPath = (categoryId) => {
  const categoryPath = interpolatePath(PATHS.CATEGORY, { id: categoryId })

  return `${categoryPath}?${URL_PARAMS.FOCUS_ON_DETAIL}=category`
}

const ProductBreadcrumb = ({ categories }) => {
  if (!categories) return null

  const mainCategory = categories[0]

  if (!mainCategory.categories) return null
  const subcategory = mainCategory.categories[0]

  return (
    <Link
      onClick={() => sendBreadcrumbClickMetrics(subcategory)}
      to={getCategoryPath(subcategory.id)}
      aria-label={getAriaLabelForProductBreadcrumb(subcategory.name)}
    >
      <span className="subhead1-r">{`${mainCategory.name} > `}</span>
      <span className="subhead1-sb">{subcategory.name}</span>
    </Link>
  )
}

ProductBreadcrumb.propTypes = {
  categories: array,
}

export { ProductBreadcrumb }
