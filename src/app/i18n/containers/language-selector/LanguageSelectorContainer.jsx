import { connect } from 'react-redux'

import { changeLanguage } from '../../commands'
import LanguageSelector from '../../components/language-selector'
import { func, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

export const LanguageSelectorContainer = ({ language, changeLanguage }) => (
  <LanguageSelector
    currentLanguage={language}
    selectLanguage={changeLanguage}
  />
)

LanguageSelectorContainer.propTypes = {
  language: string.isRequired,
  changeLanguage: func.isRequired,
}

const mapStateToProps = ({ language }) => ({
  language,
})

const mapDispatchToProps = {
  changeLanguage: createThunk(changeLanguage),
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LanguageSelectorContainer)
