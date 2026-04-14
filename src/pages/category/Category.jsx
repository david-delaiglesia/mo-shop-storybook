import { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { func, object, shape, string } from 'prop-types'

import { GridLayout } from '@mercadona/mo.library.shop-ui/grid-layout'

import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { CatalogClient } from 'app/catalog/client'
import { CategoryDetailContainer } from 'app/catalog/containers/category-detail-container'
import { SOURCES } from 'app/catalog/metrics'
import { CategoryMenu } from 'components/category-menu'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import NoResults from 'components/no-results'
import { CategoryService } from 'domain/category'
import { PATHS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'
import { getNextSubcategory } from 'utils/categories'

const getCategoryFromRoute = (match) => {
  const categoryId = match.params.id

  return parseInt(categoryId, 10)
}

const checkCategoryExists = (categories, categoryId) => {
  for (const category of categories) {
    const categoryL2 = category.categories.find(({ id }) => categoryId === id)

    if (categoryL2) {
      return true
    }
  }

  return false
}

class Category extends Component {
  state = {
    categories: null,
    categoryId: 0,
  }

  componentDidMount() {
    this.props.setHeaderType(LayoutHeaderType.DEFAULT)
    this.getCategories()
  }

  componentDidUpdate(prevProps, prevState) {
    const { match, language } = this.props
    const { categories, categoryId } = this.state
    const routeId = getCategoryFromRoute(match)

    if (!categories) return

    const addCategoryId = !prevState.categoryId && routeId
    const categoryIdHasChanged = categoryId !== routeId
    if (addCategoryId || categoryIdHasChanged) {
      const options = { category_id: routeId }
      Tracker.sendViewChange(SOURCES.CATEGORY, options)
      this.updateSelectedCategory(match)
    }

    const languageHasChanged = prevProps.language !== language
    if (languageHasChanged) {
      this.getCategories()
    }
  }

  async getCategories() {
    const { warehouse } = Session.get()
    const response = await CatalogClient.getCategories(warehouse)
    if (!response) return

    const categories = response.results
    const categoryId = CategoryService.getFirstCategoryId(categories)
    this.setState({ categories, categoryId })
  }

  updateSelectedCategory(match) {
    const categoryId = getCategoryFromRoute(match)
    const shouldUpdateCategory = this.state.categoryId !== categoryId
    if (shouldUpdateCategory) {
      this.setState((prevState) => {
        if (prevState.categoryId === categoryId) {
          return null
        }
        return { categoryId }
      })
    }
  }

  render() {
    const { categories, categoryId } = this.state

    if (!categoryId) {
      return null
    }

    if (categories.length === 0) {
      return <NoResults />
    }

    if (!checkCategoryExists(categories, categoryId)) {
      return <Redirect to={PATHS.NOT_FOUND} />
    }

    const nextSubcategory = getNextSubcategory(categories, categoryId)
    const nextSubcategoryPath = interpolatePath(PATHS.CATEGORY, {
      id: nextSubcategory?.id,
    })
    const paddingTop = `${NAVBAR_HEIGHT}px`

    const sidebar = (
      <CategoryMenu categories={categories} categoryId={categoryId} />
    )
    const content = (
      <CategoryDetailContainer
        categoryId={categoryId}
        nextSubcategory={nextSubcategory}
        nextSubcategoryPath={nextSubcategoryPath}
      />
    )
    const footer = <Footer />

    return (
      <>
        <SignInModal />
        <GridLayout paddingTop={paddingTop}>
          {{ sidebar, content, footer }}
        </GridLayout>
      </>
    )
  }
}

Category.propTypes = {
  match: shape({
    params: object,
  }).isRequired,
  language: string,
  setHeaderType: func.isRequired,
}

const mapStateToProps = ({ language }) => ({
  language,
})

const mapDispatchToProps = {
  setHeaderType,
}

const ConnectedCategory = connect(mapStateToProps, mapDispatchToProps)(Category)

export { ConnectedCategory as Category }
