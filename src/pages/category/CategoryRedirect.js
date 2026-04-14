import { Component } from 'react'

import PropTypes from 'prop-types'

import { CatalogClient } from 'app/catalog/client'
import { CategoryService } from 'domain/category'
import { PATHS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'
import { Session } from 'services/session'

class CategoryRedirect extends Component {
  async componentDidMount() {
    const { warehouse } = Session.get()
    const response = await CatalogClient.getCategories(warehouse)
    if (!response) return

    const categories = response.results
    const categoryId = CategoryService.getFirstCategoryId(categories)
    this.props.history.replace(
      interpolatePath(PATHS.CATEGORY, { id: categoryId }),
    )
  }

  render() {
    return null
  }
}

CategoryRedirect.propTypes = {
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }),
}

export { CategoryRedirect }
