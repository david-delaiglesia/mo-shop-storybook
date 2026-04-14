import { useEffect } from 'react'

import { func, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './styles/Disclaimer.css'

const Disclaimer = ({ text, sendViewChangeMetrics, t }) => {
  useEffect(() => {
    if (sendViewChangeMetrics) {
      sendViewChangeMetrics()
    }
  }, [])

  return (
    <div role="banner" aria-label="disclaimer" className="disclaimer body1-r">
      {t(text)}
    </div>
  )
}

Disclaimer.propTypes = {
  text: string.isRequired,
  sendViewChangeMetrics: func,
  t: func.isRequired,
}

const ComposedDisclaimer = withTranslate(Disclaimer)

export { ComposedDisclaimer as Disclaimer }
