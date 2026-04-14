import { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'

import { userAreaRoutes } from './routes'
import { func } from 'prop-types'

import { NoFlexibleLayout } from '@mercadona/mo.library.shop-ui/no-flexible-layout'

import { UserAreaMenuContainer } from 'app/user/containers/user-area-menu-container'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { PATHS } from 'pages/paths'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const routesName = Object.keys(userAreaRoutes)

class UserArea extends Component {
  componentDidMount = () => {
    this.props.setHeaderType(LayoutHeaderType.DEFAULT)
  }

  render() {
    const paddingTop = `${NAVBAR_HEIGHT}px`
    const content = (
      <Switch>
        {routesName.map((route) => (
          <Route
            key={route}
            path={userAreaRoutes[route].path}
            exact={userAreaRoutes[route].exact}
            component={userAreaRoutes[route].component}
          />
        ))}
        <Redirect from="*" to={PATHS.NOT_FOUND} />
      </Switch>
    )

    const sidebar = <UserAreaMenuContainer />
    const footer = <Footer />

    return (
      <NoFlexibleLayout paddingTop={paddingTop}>
        {{ sidebar, content, footer }}
      </NoFlexibleLayout>
    )
  }
}

UserArea.propTypes = {
  setHeaderType: func.isRequired,
}

const mapDispatchToProps = {
  setHeaderType,
}

const ConnectedUserArea = connect(null, mapDispatchToProps)(UserArea)

export { ConnectedUserArea as UserArea }
