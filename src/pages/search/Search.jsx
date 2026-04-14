import { Component } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'

import { func, object } from 'prop-types'

import { GridLayout } from '@mercadona/mo.library.shop-ui/grid-layout'

import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { SOURCES } from 'app/catalog/metrics'
import { SearchFacets } from 'app/search/components/search-facets'
import { SearchResultsContainer } from 'app/search/containers/search-results-container'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { Tracker } from 'services/tracker'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const SearchFacetsWrapper = () => {
  const { t } = useTranslation()

  return <SearchFacets t={t} />
}

class Search extends Component {
  componentDidMount() {
    Tracker.sendViewChange(SOURCES.SEARCH)
    this.props.setHeaderType(LayoutHeaderType.DEFAULT)
  }

  render() {
    const { search } = this.props
    const paddingTop = `${NAVBAR_HEIGHT}px`
    const showSidebar = search.query && search.hits.length > 0

    const sidebar = <SearchFacetsWrapper />
    const content = <SearchResultsContainer withMessage={true} />
    const footer = <Footer />

    return (
      <>
        <SignInModal />
        <GridLayout paddingTop={paddingTop} expanded={showSidebar}>
          {{ sidebar, content, footer }}
        </GridLayout>
      </>
    )
  }
}

Search.propTypes = {
  setHeaderType: func.isRequired,
  search: object.isRequired,
}

const mapStateToProps = ({ search, language }) => ({
  search,
  language,
})

const mapDispatchToProps = {
  setHeaderType,
}

const ConnectedSearch = connect(mapStateToProps, mapDispatchToProps)(Search)

export { ConnectedSearch as Search }
