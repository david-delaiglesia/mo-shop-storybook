import { connect } from 'react-redux'

import { bool, object } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { SearchResults } from 'app/search/components/search-results'

const SearchResultsContainer = ({ withMessage, search }) => {
  if (!search.query) {
    return null
  }

  return <SearchResults withMessage={withMessage} search={search} />
}

SearchResultsContainer.propTypes = {
  withMessage: bool,
  search: object.isRequired,
}

const mapStateToProps = ({ search }) => ({
  search,
})

const ComposedSearchResultsContainer = compose(connect(mapStateToProps))(
  SearchResultsContainer,
)

export { ComposedSearchResultsContainer as SearchResultsContainer }
