import { PureComponent, createRef } from 'react'

import PropTypes from 'prop-types'

import { TAB_INDEX } from 'utils/constants'

import './styles/LanguageItem.css'

export const DEFAULT_CLASS_NAME = 'language-item'
export const ACTIVE_CLASS_NAME = `${DEFAULT_CLASS_NAME} active`

class LanguageItem extends PureComponent {
  constructor() {
    super()

    this.langRef = createRef()

    this.onSelectLanguage = this.onSelectLanguage.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
  }

  componentDidMount() {
    if (this.hasItemSelected()) {
      this.langRef.current.focus()
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedLanguage: prevSelectedLanguage } = prevProps
    const { selectedLanguage } = this.props
    const hasChangedLanguage = selectedLanguage !== prevSelectedLanguage

    if (this.hasItemSelected() && hasChangedLanguage) {
      this.langRef.current.focus()
    }
  }

  hasItemSelected() {
    const { position, selectedLanguage } = this.props

    return position === selectedLanguage
  }

  onSelectLanguage() {
    const { lang, selectLanguage } = this.props

    selectLanguage(lang)
  }

  getClassName() {
    if (this.hasItemSelected()) {
      return ACTIVE_CLASS_NAME
    }

    return DEFAULT_CLASS_NAME
  }

  onMouseOver() {
    const { position, setSelectedLanguage } = this.props

    setSelectedLanguage(position)
  }

  render() {
    const { langText } = this.props

    return (
      <li
        ref={this.langRef}
        className={this.getClassName()}
        onMouseOver={this.onMouseOver}
        onClick={this.onSelectLanguage}
        tabIndex={TAB_INDEX.DISABLED}
      >
        {langText}
      </li>
    )
  }
}

LanguageItem.propTypes = {
  lang: PropTypes.string.isRequired,
  langText: PropTypes.string.isRequired,
  position: PropTypes.number.isRequired,
  selectedLanguage: PropTypes.number.isRequired,
  setSelectedLanguage: PropTypes.func.isRequired,
  selectLanguage: PropTypes.func.isRequired,
}

export default LanguageItem
