import { useEffect } from 'react'

import { AndroidLayout } from './AndroidLayout'
import { GenericLayout } from './GenericLayout'
import { iOSLayout } from './iOSLayout'
import { string } from 'prop-types'

import { sendMobileBlockerViewMetrics } from 'app/shared/metrics'
import { MOBILE_OS } from 'libs/mobile-detector'

import './assets/MobileBlockerLayout.css'

const { ANDROID, IOS, GENERIC } = MOBILE_OS
const layoutMapping = {
  [GENERIC]: GenericLayout,
  [ANDROID]: AndroidLayout,
  [IOS]: iOSLayout,
}

const MobileBlockerLayout = ({ layout }) => {
  useEffect(() => {
    sendMobileBlockerViewMetrics()
  }, [])

  const Component = layoutMapping[layout]

  return <Component />
}

MobileBlockerLayout.propTypes = {
  layout: string.isRequired,
}

export { MobileBlockerLayout }
