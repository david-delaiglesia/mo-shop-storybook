import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { NoFlexibleLayout } from '@mercadona/mo.library.shop-ui/no-flexible-layout'

import { PersonalInfoContainer } from 'app/user/containers/personal-info-container'
import { UserAreaMenuContainer } from 'app/user/containers/user-area-menu-container'
import { setHeaderType } from 'components/header-switch/actions'
import { LayoutHeaderType } from 'components/header-switch/constants'
import { NAVBAR_HEIGHT } from 'system-ui/constants'
import { Footer } from 'system-ui/footer'

const PersonalInfo = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setHeaderType(LayoutHeaderType.DEFAULT))
  }, [])

  const paddingTop = `${NAVBAR_HEIGHT}px`
  const sidebar = <UserAreaMenuContainer />
  const content = <PersonalInfoContainer />
  const footer = <Footer />

  return (
    <NoFlexibleLayout paddingTop={paddingTop}>
      {{
        sidebar,
        content,
        footer,
      }}
    </NoFlexibleLayout>
  )
}

export { PersonalInfo }
