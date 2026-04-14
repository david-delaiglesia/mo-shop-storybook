import { render, screen } from '@testing-library/react'

import { LanguageSelector } from '../LanguageSelector'
import userEvent from '@testing-library/user-event'

const translations = {
  'list.language.ca': 'Català',
  'list.language.en': 'English',
  'list.language.es': 'Español',
  'list.language.vai': 'Valencià',
}

const t = (key) => translations[key]

describe('LanguageSelector', () => {
  it('should render the button to open the list', () => {
    render(
      <LanguageSelector currentLanguage="en" selectLanguage={vi.fn()} t={t} />,
    )

    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('should render the languages list', () => {
    render(
      <LanguageSelector currentLanguage="en" selectLanguage={vi.fn()} t={t} />,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))

    const list = screen.getByRole('list')
    expect(list).toContainElement(
      screen.getByText('Español', { selector: 'li' }),
    )
    expect(list).toContainElement(
      screen.getByText('Valencià', { selector: 'li' }),
    )
    expect(list).toContainElement(
      screen.getByText('Català', { selector: 'li' }),
    )
    expect(list).toContainElement(
      screen.getByText('English', { selector: 'li' }),
    )
  })

  it('should be able to select a new language', () => {
    const changeLanguage = vi.fn()
    render(
      <LanguageSelector
        currentLanguage="en"
        selectLanguage={changeLanguage}
        t={t}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))
    userEvent.click(screen.getByText('Español', { selector: 'li' }))

    expect(changeLanguage).toHaveBeenCalledWith('es')
  })

  it('should close the dropdown clicking outside', () => {
    render(
      <div>
        <button>Other button</button>
        <LanguageSelector currentLanguage="en" selectLanguage={vi.fn()} t={t} />
      </div>,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))
    const list = screen.getByRole('list')
    userEvent.click(screen.getByText('Other button'))

    expect(list).not.toBeInTheDocument()
  })

  it('should close the dropdown pressing the ESC key', () => {
    render(
      <LanguageSelector currentLanguage="en" selectLanguage={vi.fn()} t={t} />,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))
    const list = screen.getByRole('list')
    userEvent.type(screen.getByRole('button', { name: 'English' }), '{esc}')

    expect(list).not.toBeInTheDocument()
  })

  it('should close the dropdown pressing TAB', () => {
    render(
      <LanguageSelector currentLanguage="en" selectLanguage={vi.fn()} t={t} />,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))
    const list = screen.getByRole('list')
    userEvent.tab()

    expect(list).not.toBeInTheDocument()
  })

  it('should select the languages with the ARROW_UP key', () => {
    render(
      <LanguageSelector currentLanguage="en" selectLanguage={vi.fn()} t={t} />,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))
    userEvent.type(screen.getByRole('list'), '{arrowup}')

    expect(screen.getByText('Català')).toHaveClass('active')
  })

  it('should select the languages with the ARROW_DOWN key', () => {
    render(
      <LanguageSelector currentLanguage="en" selectLanguage={vi.fn()} t={t} />,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))
    userEvent.type(screen.getByRole('list'), '{arrowup}')
    userEvent.type(screen.getByRole('list'), '{arrowup}')
    userEvent.type(screen.getByRole('list'), '{arrowdown}')

    expect(screen.getByText('Català')).toHaveClass('active')
  })

  it('should confirm the selected language with the ENTER key', () => {
    const changeLanguage = vi.fn()
    render(
      <LanguageSelector
        currentLanguage="en"
        selectLanguage={changeLanguage}
        t={t}
      />,
    )

    userEvent.click(screen.getByRole('button', { name: 'English' }))
    userEvent.type(screen.getByRole('list'), '{arrowup}')
    userEvent.type(screen.getByRole('list'), '{enter}')

    expect(changeLanguage).toHaveBeenCalledWith('ca')
  })
})
