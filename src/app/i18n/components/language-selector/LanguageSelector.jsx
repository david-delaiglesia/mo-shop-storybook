import { PureComponent, createRef } from 'react'

import { withTranslate } from '../../containers/i18n-provider'
import LanguageItem from '../language-item'
import { func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { DropdownWithClickOut } from 'components/dropdown'
import { TAB_INDEX, constants } from 'utils/constants'

import './LanguageSelector.css'

export const DEFAULT_LANGUAGE_POSITION = 0
export const LANGUAGE_SELECTED_CLASS = 'current_language'
export const LANGUAGE_SELECTED_ACTIVE_CLASS = 'active'
export const LANGUAGE_LIST_CLASS = 'language_list'

const { AVAILABLE_LANGUAGES } = constants

export class LanguageSelector extends PureComponent {
  constructor() {
    super()

    this.state = {
      selectedLanguage: DEFAULT_LANGUAGE_POSITION,
      openDropDown: false,
    }

    this.availableLanguages = AVAILABLE_LANGUAGES

    this.languageSelectorRef = createRef()

    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
    this.selectLanguage = this.selectLanguage.bind(this)
    this.setSelectedLanguage = this.setSelectedLanguage.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  componentDidMount() {
    this.languageSelectorRef.current.addEventListener(
      'keydown',
      this.handleKeyPress,
    )
  }

  componentWillUnmount() {
    this.languageSelectorRef.current.removeEventListener(
      'keydown',
      this.handleKeyPress,
    )
  }

  handleKeyPress(event) {
    const { selectedLanguage, openDropDown } = this.state
    const limitPosition = this.availableLanguages.length - 1

    const keysMap = {
      ArrowDown: {
        validation: selectedLanguage < limitPosition,
        action: this.setSelectedLanguage,
        parameters: selectedLanguage + 1,
        preventDefault: true,
      },
      ArrowUp: {
        validation: selectedLanguage > DEFAULT_LANGUAGE_POSITION,
        action: this.setSelectedLanguage,
        parameters: selectedLanguage - 1,
        preventDefault: true,
      },
      Enter: {
        validation: selectedLanguage >= DEFAULT_LANGUAGE_POSITION,
        action: openDropDown ? this.selectLanguage : this.toggleDropdown,
        parameters: this.availableLanguages[selectedLanguage],
      },
      Tab: {
        validation: openDropDown,
        action: this.toggleDropdown,
      },
      Escape: {
        validation: openDropDown,
        action: this.toggleDropdown,
      },
    }

    const keyMap = keysMap[event.key]

    if (keyMap) {
      keyMap.validation && keyMap.action(keyMap.parameters)
      keyMap.preventDefault && event.preventDefault()
    }
  }

  getLanguageIndex() {
    const { currentLanguage } = this.props

    return this.availableLanguages.findIndex((lang) => lang === currentLanguage)
  }

  setSelectedLanguageIndex() {
    const currentLanguageIndex = this.getLanguageIndex()

    this.setSelectedLanguage(currentLanguageIndex)
  }

  setSelectedLanguage(selectedLanguage) {
    this.setState({ selectedLanguage })
  }

  selectLanguage(language) {
    const { selectLanguage } = this.props

    this.toggleDropdown()
    selectLanguage(language)
  }

  toggleDropdown() {
    const { openDropDown } = this.state

    this.setState({
      openDropDown: !openDropDown,
    })

    if (!openDropDown) {
      this.setSelectedLanguageIndex()
    }
  }

  closeDropdown() {
    this.setState({ openDropDown: false })
  }

  renderLanguageSelected() {
    const { openDropDown } = this.state
    const { currentLanguage, t } = this.props

    const className = openDropDown
      ? `${LANGUAGE_SELECTED_CLASS} ${LANGUAGE_SELECTED_ACTIVE_CLASS}`
      : LANGUAGE_SELECTED_CLASS

    return (
      <div className={className}>
        <p>{t(`list.language.${currentLanguage}`)}</p>
        <Icon icon={'chevron-down'} />
      </div>
    )
  }

  renderAvailableLanguages() {
    const { selectedLanguage } = this.state
    const { t } = this.props

    return (
      <ul tabIndex={TAB_INDEX.DISABLED} className={LANGUAGE_LIST_CLASS}>
        {this.availableLanguages.map((lang, index) => (
          <LanguageItem
            key={index}
            lang={lang}
            langText={t(`list.language.${lang}`)}
            position={index}
            selectedLanguage={selectedLanguage}
            selectLanguage={this.selectLanguage}
            setSelectedLanguage={this.setSelectedLanguage}
          />
        ))}
      </ul>
    )
  }

  render() {
    return (
      <div className="language_selector" ref={this.languageSelectorRef}>
        <DropdownWithClickOut
          handleClickOutside={this.closeDropdown}
          header={this.renderLanguageSelected()}
          content={this.renderAvailableLanguages()}
          open={this.state.openDropDown}
          toggleDropdown={this.toggleDropdown}
          datatest="language-selector"
          ariaLabel={this.props.t('accessibility_language_selector')}
        />
      </div>
    )
  }
}

LanguageSelector.propTypes = {
  currentLanguage: string.isRequired,
  selectLanguage: func.isRequired,
  t: func.isRequired,
}

export default withTranslate(LanguageSelector)
