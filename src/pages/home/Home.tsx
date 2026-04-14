import { useEffect } from 'react'
import { connect } from 'react-redux'

import { generateEventPayload } from './helper'
import { func } from 'prop-types'

import { BlankLayout } from '@mercadona/mo.library.shop-ui/blank-layout'

import { SignInModal } from 'app/authentication/components/sign-in-modal'
import { SOURCES, addCampaignToUserProperties } from 'app/catalog/metrics'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { SetHeaderTypeAction } from 'components/header-switch/interfaces'
import { HomeSections } from 'containers/home-sections'
import { Tracker } from 'services/tracker'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

interface HomeProps {
  setHeaderType: SetHeaderTypeAction
}

const Home = ({ setHeaderType }: HomeProps) => {
  useEffect(() => {
    setHeaderType(LayoutHeaderType.DEFAULT)

    const eventPayload = generateEventPayload()

    Tracker.sendViewChange(SOURCES.HOME, eventPayload)

    addCampaignToUserProperties()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const paddingTop = `${NAVBAR_HEIGHT}px`
  const content = <HomeSections />
  const footer = <Footer />

  return (
    <>
      <SignInModal />
      <BlankLayout paddingTop={paddingTop}>{{ content, footer }}</BlankLayout>
    </>
  )
}

Home.propTypes = {
  setHeaderType: func.isRequired,
}

const mapDispatchToProps = {
  setHeaderType,
}

const ComposedHome = connect(null, mapDispatchToProps)(Home)

export { ComposedHome as Home }
