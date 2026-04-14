import PropTypes from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './assets/NoResults.css'

const NoResults = ({ text, t }) => {
  return (
    <p className="no-results">{text ? t(text) : t('no_results.default')}</p>
  )
}

NoResults.propTypes = {
  text: PropTypes.string,
  t: PropTypes.func.isRequired,
}

export const PlainNoResults = NoResults

export default withTranslate(NoResults)
